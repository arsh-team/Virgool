// app/api/user/change-type/route.js
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import { authenticateRequest } from "../../../../lib/auth";
import { sanitizeInput } from "../../../../lib/security";

export async function POST(request) {
  try {
    await connectDB();

    // احراز هویت متمرکز
    const auth = await authenticateRequest(request);
    if (auth.error) {
      return Response.json(
        { success: false, message: auth.error },
        { status: auth.status }
      );
    }

    const body = sanitizeInput(await request.json());
    const { newType } = body;

    // SECURITY: فقط user و creator مجاز هستند - هرگز admin
    if (!["user", "creator"].includes(newType)) {
      return Response.json(
        { success: false, message: "نوع حساب معتبر نیست (فقط user یا creator)" },
        { status: 400 }
      );
    }

    const user = await User.findById(auth.userId);
    if (!user) {
      return Response.json(
        { success: false, message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    if (user.type === newType) {
      return Response.json(
        { success: false, message: `حساب شما همین الان هم ${newType} است` },
        { status: 400 }
      );
    }

    // SECURITY: جلوگیری از privilege escalation
    // هیچ کاربری نمی‌تواند خودش را به admin تبدیل کند
    // کاربر عادی فقط می‌تواند به creator تبدیل شود (با تأیید پشتیبانی)
    // creator می‌تواند به user تبدیل شود (تنزل سطح)
    // admin نمی‌تواند نوع حساب خود را تغییر دهد
    if (user.type === 'user' && newType === 'creator') {
      return Response.json(
        { success: false, message: "برای ارتقا به حساب سازنده، باید از طریق پشتیبانی اقدام کنید" },
        { status: 403 }
      );
    }

    user.type = newType;
    await user.save();

    return Response.json(
      {
        success: true,
        message: `نوع حساب با موفقیت به ${newType} تغییر یافت`,
        type: user.type,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("خطا در تغییر نوع حساب:", error);
    return Response.json(
      { success: false, message: "خطای سرور" },
      { status: 500 }
    );
  }
}