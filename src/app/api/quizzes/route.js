import { connectDB } from "../../../lib/db";
import Quiz from "../../../models/Quiz";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../lib/auth";
export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.log("🔍 دریافت تمام آزمون‌های کاربر:", decoded.id);
    const quizzes = await Quiz.find({ 
      createdBy: decoded.id 
    })
    .populate('service', 'title')
    .sort({ createdAt: -1 });
    console.log(`📊 تعداد کل آزمون‌های یافت شده: ${quizzes.length}`);
    return new Response(JSON.stringify({ quizzes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching all quizzes:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت آزمون‌ها" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}