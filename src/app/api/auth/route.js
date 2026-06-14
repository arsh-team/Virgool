import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  isValidEmail,
  validatePasswordStrength,
  sanitizeInput,
} from "../../../lib/security";

const SECRET = process.env.JWT_SECRET;
if (!SECRET)
  throw new Error(
    "FATAL: JWT_SECRET is not set. The application cannot start.",
  );

export async function POST(req) {
  try {
    await connectDB();

    const body = sanitizeInput(await req.json());
    const { mode, email, password, firstname, lastname, isInstitutionAccount } =
      body;

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "ایمیل و رمز عبور الزامی است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // اعتبارسنجی فرمت ایمیل
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "فرمت ایمیل نامعتبر است" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ثبت نام
    if (mode === "register") {
      // بررسی قوت رمز عبور
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.valid) {
        return new Response(
          JSON.stringify({ error: passwordCheck.errors.join(". ") }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      let existing = await User.findOne({ email });
      if (existing) {
        return new Response(
          JSON.stringify({ error: "این ایمیل قبلاً ثبت شده است" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const type = isInstitutionAccount ? "creator" : "user";

      // 🔥 رفع باگ ۱: هش کردن صریح رمز عبور قبل از ذخیره در دیتابیس
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User({
        email,
        password: hashedPassword,
        firstname: firstname || "",
        lastname: lastname || "",
        type,
      });

      await user.save();

      // ⚡ اصلاح زمان انقضا به یک بازه منطقی‌تر (مثلاً 6 ماه)
      const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "180d" });
      return new Response(
        JSON.stringify({
          success: true,
          token,
          type: user.type,
          message: "ثبت‌نام با موفقیت انجام شد",
        }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // ورود
    if (mode === "login") {
      const user = await User.findOne({ email }).select("+password");

      // 🔥 رفع باگ ۲: یکی کردن پیام‌های خطا برای جلوگیری از User Enumeration
      if (!user) {
        return new Response(
          JSON.stringify({ error: "ایمیل یا رمز عبور اشتباه است" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return new Response(
          JSON.stringify({ error: "ایمیل یا رمز عبور اشتباه است" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      // ⚡ اصلاح زمان انقضا به یک بازه منطقی‌تر
      const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });

      return new Response(
        JSON.stringify({
          success: true,
          token,
          type: user.type,
          user: {
            id: user._id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ error: "حالت نامعتبر است" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Auth error:", error);
    return new Response(JSON.stringify({ error: "خطای داخلی سرور" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(_req) {
  return new Response(
    JSON.stringify({
      error: "متد GET پشتیبانی نمی‌شود. از POST استفاده کنید.",
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    },
  );
}
