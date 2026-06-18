import { connectDB } from "../../../lib/db";
import Contact from "../../../models/Contact";
import { sanitizeInput } from "../../../lib/security";

const contactRateLimit = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of contactRateLimit) {
    if (now - data.lastRequest > 3600000) { // 1 hour
      contactRateLimit.delete(ip);
    }
  }
  // Max size check
  if (contactRateLimit.size > 10000) {
    // Remove oldest entries
    const entries = [...contactRateLimit.entries()].sort((a, b) => a[1].lastRequest - b[1].lastRequest);
    for (let i = 0; i < 1000; i++) {
      contactRateLimit.delete(entries[i][0]);
    }
  }
}, 300000);

export async function POST(request) {
  try {
    const body = sanitizeInput(await request.json());
    const { name, email, phone = "", message } = body || {};
    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "لطفا نام، ایمیل و پیام را وارد کنید." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    // محدودیت طول ورودی‌ها برای جلوگیری از حملات
    if (name.length > 200 || email.length > 200 || message.length > 5000 || phone.length > 20) {
      return new Response(JSON.stringify({ error: "طول ورودی‌ها بیش از حد مجاز است." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    await connectDB();
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const now = Date.now();
    const lastSubmission = contactRateLimit.get(ip);
    if (lastSubmission && now - lastSubmission.lastRequest < 60000) {
      return new Response(JSON.stringify({ error: "لطفاً یک دقیقه صبر کنید و دوباره تلاش کنید" }), {
        status: 429,
        headers: { "Content-Type": "application/json" },
      });
    }
    contactRateLimit.set(ip, { lastRequest: now });
    const userAgent = request.headers.get("user-agent") || "";
    const doc = await Contact.create({ name, email, phone, message, ip, userAgent });
    return new Response(JSON.stringify({ ok: true, id: doc._id }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving contact:", error);
    return new Response(JSON.stringify({ error: "خطا در ثبت پیام" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
export async function GET() {
  // Optional: provide a safe read endpoint if needed in future. For now, return 405.
  return new Response(null, { status: 405 });
}
