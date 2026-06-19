/**
 * Smart Rate Limiter — Sliding Window + Behavioral Analysis
 *
 * Distinguishes legitimate browser traffic from bots/attackers.
 * Uses sliding window counters, user-agent analysis, and IP reputation scoring.
 * Edge-runtime compatible (no Node.js APIs).
 */

// ─── Configuration ───────────────────────────────────────────────────────────

const TIERS = {
  auth: { browser: 20, unknown: 8, bot: 3, windowMs: 60_000 },
  payment: { browser: 30, unknown: 10, bot: 5, windowMs: 60_000 },
  sensitive: { browser: 50, unknown: 15, bot: 5, windowMs: 60_000 },
  standard: { browser: 200, unknown: 60, bot: 20, windowMs: 60_000 },
  public: { browser: 300, unknown: 100, bot: 30, windowMs: 60_000 },
};

const TIER_MAP = [
  { prefix: "/api/auth", tier: "auth" },
  { prefix: "/api/payment", tier: "payment" },
  { prefix: "/api/user/wallet", tier: "payment" },
  { prefix: "/api/contact", tier: "sensitive" },
  { prefix: "/api/cron", tier: "sensitive" },
];

const DEFAULT_TIER = "standard";

const BACKPRESSURE_THRESHOLD = 0.7;
const OFFENSE_DECAY_MS = 300_000;
const OFFENSE_EXPIRY_MS = 600_000;
const CLEANUP_INTERVAL_MS = 60_000;
const MAX_STORE_SIZE = 50_000;

// Known good browser signatures (substring match)
const BROWSER_SIGNATURES = [
  "Mozilla/5.0",
  "Chrome/",
  "Firefox/",
  "Safari/",
  "Edge/",
  "OPR/",
  "Vivaldi/",
  "Brave",
  "SamsungBrowser",
  "Instagram",
  "Twitterbot",
  "facebookexternalhit",
  "WhatsApp",
  "TelegramBot",
  "Slackbot",
  "LinkedInBot",
];

const BOT_SIGNATURES = [
  "curl/",
  "wget/",
  "python-requests/",
  "Go-http-client/",
  "java/",
  "apache-httpclient",
  "Scrapy",
  "HeadlessChrome",
  "PhantomJS",
  "bot",
  "spider",
  "crawler",
  "scan",
];

// ─── Store ───────────────────────────────────────────────────────────────────

const store = new Map();

let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  if (store.size <= MAX_STORE_SIZE * 0.8) return;

  for (const [key, entry] of store) {
    const windowMs = entry.windowMs || 60_000;
    if (now - entry.currentStart > windowMs * 2) {
      store.delete(key);
    }
  }

  // Hard cap: if store is still too large after cleanup, remove oldest entries
  if (store.size > MAX_STORE_SIZE) {
    const entries = [...store.entries()].sort((a, b) => a[1].currentStart - b[1].currentStart);
    const toRemove = entries.slice(0, store.size - Math.floor(MAX_STORE_SIZE * 0.8));
    for (const [key] of toRemove) {
      store.delete(key);
    }
  }
}

// ─── Classification ──────────────────────────────────────────────────────────

export function classifyUserAgent(ua) {
  if (!ua || ua.trim().length === 0) return "bot";

  const lower = ua.toLowerCase();

  for (const sig of BOT_SIGNATURES) {
    if (lower.includes(sig.toLowerCase())) return "bot";
  }

  for (const sig of BROWSER_SIGNATURES) {
    if (lower.includes(sig.toLowerCase())) return "browser";
  }

  if (ua.length < 20) return "bot";

  return "unknown";
}

function getTier(pathname) {
  for (const { prefix, tier } of TIER_MAP) {
    if (pathname.startsWith(prefix)) return tier;
  }
  return DEFAULT_TIER;
}

function getEffectiveLimit(tier, classification) {
  const config = TIERS[tier] || TIERS[DEFAULT_TIER];
  return config[classification] || config.unknown;
}

function getWindowMs(tier) {
  return (TIERS[tier] || TIERS[DEFAULT_TIER]).windowMs;
}

// ─── Sliding Window Counter ──────────────────────────────────────────────────

function slidingWindowCount(entry, now) {
  const windowMs = entry.windowMs || 60_000;

  const prevCount = entry.prevCount || 0;
  const curStart = entry.currentStart || now;
  const curCount = entry.currentCount || 0;

  const elapsed = now - curStart;

  if (elapsed >= windowMs) {
    return { count: 0, windowExpired: true };
  }

  const overlap = 1 - elapsed / windowMs;
  const approxCount = prevCount * overlap + curCount;

  return { count: approxCount, windowExpired: false };
}

function rotateWindow(entry, now) {
  const windowMs = entry.windowMs || 60_000;

  if (now - entry.currentStart >= windowMs) {
    entry.prevStart = entry.currentStart;
    entry.prevCount = entry.currentCount;
    entry.currentStart = now;
    entry.currentCount = 0;
  }
}

// ─── IP Reputation ───────────────────────────────────────────────────────────

function getOffenseScore(entry, now) {
  if (!entry.offenseScore || entry.offenseScore === 0) return 0;
  const elapsed = now - (entry.lastOffenseAt || 0);
  if (elapsed > OFFENSE_EXPIRY_MS) {
    entry.offenseScore = 0;
    return 0;
  }
  const decay = Math.max(0, 1 - elapsed / OFFENSE_DECAY_MS);
  return entry.offenseScore * decay;
}

function recordOffense(entry, now) {
  entry.offenseScore = (entry.offenseScore || 0) + 1;
  entry.lastOffenseAt = now;
}

function getRepeatOffensePenalty(entry, now) {
  const score = getOffenseScore(entry, now);
  if (score >= 5) return { blocked: true, retryAfter: 120 };
  if (score >= 3) return { blocked: true, retryAfter: 60 };
  if (score >= 1.5) return { blocked: true, retryAfter: 30 };
  return { blocked: false };
}

// ─── Core Rate Limit Check ───────────────────────────────────────────────────

export function createKey(ip, pathname) {
  const tier = getTier(pathname);
  return `${ip}:${tier}`;
}

export function checkRateLimit(ip, pathname, userUA, hasAuthToken) {
  cleanup();

  const classification = classifyUserAgent(userUA);
  const tier = getTier(pathname);
  const now = Date.now();
  const key = createKey(ip, pathname);

  let entry = store.get(key);
  if (!entry) {
    entry = {
      windowMs: getWindowMs(tier),
      currentStart: now,
      currentCount: 0,
      prevStart: 0,
      prevCount: 0,
      offenseScore: 0,
      lastOffenseAt: 0,
      lastRequestAt: 0,
      consecutiveSamePath: 0,
      lastPath: "",
    };
    store.set(key, entry);
  }

  rotateWindow(entry, now);

  const repeatOffense = getRepeatOffensePenalty(entry, now);
  if (repeatOffense.blocked) {
    return {
      allowed: false,
      limited: true,
      reason: "repeat_offender",
      retryAfter: repeatOffense.retryAfter,
      classification,
      tier,
    };
  }

  const limit = getEffectiveLimit(tier, classification);

  let effectiveLimit = limit;
  if (hasAuthToken) {
    effectiveLimit = Math.ceil(limit * 1.5);
  }

  const { count: approxCount } = slidingWindowCount(entry, now);

  if (approxCount > effectiveLimit) {
    recordOffense(entry, now);
    const penalty = getRepeatOffensePenalty(entry, now);
    const retryAfter = penalty.blocked ? penalty.retryAfter : Math.ceil(getWindowMs(tier) / 1000);

    return {
      allowed: false,
      limited: true,
      reason: "rate_exceeded",
      retryAfter,
      limit: Math.ceil(effectiveLimit),
      classification,
      tier,
    };
  }

  // Only increment counter for allowed requests
  entry.currentCount++;
  entry.lastRequestAt = now;

  if (pathname === entry.lastPath) {
    entry.consecutiveSamePath++;
  } else {
    entry.consecutiveSamePath = 0;
    entry.lastPath = pathname;
  }

  if (approxCount > effectiveLimit * BACKPRESSURE_THRESHOLD) {
    const delayMs = Math.min(
      Math.ceil(((approxCount / effectiveLimit) - BACKPRESSURE_THRESHOLD) * 500),
      2000
    );
    return {
      allowed: true,
      limited: false,
      backpressure: delayMs,
      remaining: Math.max(0, Math.ceil(effectiveLimit - approxCount)),
      limit: Math.ceil(effectiveLimit),
      classification,
      tier,
    };
  }

  return {
    allowed: true,
    limited: false,
    backpressure: 0,
    remaining: Math.max(0, Math.ceil(effectiveLimit - approxCount)),
    limit: Math.ceil(effectiveLimit),
    classification,
    tier,
  };
}

// ─── Route-Level Helper ──────────────────────────────────────────────────────

export function rateLimit(key, maxRequests = 60, windowMs = 60000) {
  const now = Date.now();
  const entryKey = `route:${key}`;
  let entry = store.get(entryKey);

  if (!entry) {
    entry = {
      windowMs,
      currentStart: now,
      currentCount: 1,
      prevStart: 0,
      prevCount: 0,
      offenseScore: 0,
      lastOffenseAt: 0,
      lastRequestAt: now,
      consecutiveSamePath: 0,
      lastPath: "",
    };
    store.set(entryKey, entry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  rotateWindow(entry, now);
  entry.currentCount++;
  entry.lastRequestAt = now;

  const { count: approxCount } = slidingWindowCount(entry, now);

  if (approxCount >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.currentStart + windowMs,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, Math.ceil(maxRequests - approxCount)),
    resetAt: entry.currentStart + windowMs,
  };
}
