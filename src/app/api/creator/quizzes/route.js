import { connectDB } from "../../../../lib/db";
import Quiz from "../../../../models/Quiz";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), { status: 401 });
    }
    const user = await User.findById(decoded.id);
    if (!user || user.type !== 'creator') {
      return Response.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
    const quizzes = await Quiz.find({ 
      createdBy: decoded.id,
      isActive: true
    })
    .select('title description questions timeLimit passingScore maxAttempts isActive')
    .sort({ createdAt: -1 });
    return new Response(JSON.stringify({ quizzes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching creator quizzes:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت آزمون‌ها" }),
      { status: 500 }
    );
  }
}