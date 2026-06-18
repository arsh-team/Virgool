import { NextResponse } from "next/server";
import { checkRateLimit } from "../src/lib/rate-limiter";

function getClientIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function hasAuthToken(request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  // Basic JWT format check: should have 3 parts separated by dots
  return token.split('.').length === 3 && token.length > 20;
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/api/")) return NextResponse.next();

  const clientIP = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";
  const hasToken = hasAuthToken(request);

  const result = checkRateLimit(clientIP, pathname, userAgent, hasToken);

  if (result.limited) {
    return new NextResponse(
      JSON.stringify({
        error: result.reason === "repeat_offender"
          ? "دسترسی موقتاً محدود شده است."
          : "درخواست‌های بیش از حد. لطفاً کمی صبر کنید.",
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(result.retryAfter),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Class": result.classification,
          "X-RateLimit-Tier": result.tier,
        },
      },
    );
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) {
    return new NextResponse(
      JSON.stringify({ error: "حجم درخواست بیش از حد مجاز است" }),
      { status: 413, headers: { "Content-Type": "application/json" } },
    );
  }
  // NOTE: Chunked transfer-encoding can bypass content-length checks.
  // For chunked requests, we rely on the framework's built-in body size limits.
  // To fully prevent oversized chunked uploads, configure server-level limits.

  const response = NextResponse.next();

  if (result.backpressure > 0) {
    response.headers.set("X-RateLimit-Delay", String(result.backpressure));
  }

  response.headers.set("X-RateLimit-Limit", String(result.limit || 0));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining || 0));
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.delete("X-Powered-By");
  return response;
}

export const config = { matcher: ["/api/:path*"] };
