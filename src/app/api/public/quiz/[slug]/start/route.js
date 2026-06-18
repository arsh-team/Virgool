// app/api/public/quiz/[slug]/start/route.js
import { connectDB } from "../../../../../../lib/db";
import Quiz from "../../../../../../models/Quiz";
import Attempt from "../../../../../../models/Attempt";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../../lib/auth";

async function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return { userId: decoded.id };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { status: auth.status, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { slug } = await params;
    const { userId } = auth;
    
    const quiz = await Quiz.findById(slug);
    if (!quiz) {
      return new Response(
        JSON.stringify({ error: "آزمون یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (!quiz.isActive) {
      return new Response(
        JSON.stringify({ error: "این آزمون در حال حاضر فعال نیست" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const now = new Date();
    
    // بررسی زمان شروع آزمون
    if (now < quiz.startDate) {
      return new Response(
        JSON.stringify({ 
          error: "آزمون هنوز شروع نشده است",
          startDate: quiz.startDate,
          remainingTime: quiz.startDate.getTime() - now.getTime()
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // بررسی زمان پایان آزمون
    if (quiz.endDate && now > quiz.endDate) {
      return new Response(
        JSON.stringify({ 
          error: "زمان آزمون به پایان رسیده است",
          endDate: quiz.endDate
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // بررسی تعداد تلاش‌های قبلی (شامل تکمیل شده و منقضی)
    const attemptCount = await Attempt.countDocuments({
      quiz: quiz._id,
      user: userId,
      status: { $in: ['completed', 'expired'] }
    });
    
    const maxAttempts = quiz.maxAttempts || 1;
    
    if (attemptCount >= maxAttempts) {
      return new Response(
        JSON.stringify({ 
          error: "شما قبلاً در این آزمون شرکت کرده‌اید",
          maxAttempts: maxAttempts,
          attemptCount: attemptCount
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // بررسی تلاش در حال انجام
    const existingAttempt = await Attempt.findOne({
      quiz: quiz._id,
      user: userId,
      status: { $in: ['in_progress', 'paused'] }
    });
    
    if (existingAttempt) {
      return new Response(
        JSON.stringify({
          attempt: {
            _id: existingAttempt._id,
            startTime: existingAttempt.startTime,
            timeLimit: quiz.timeLimit
          },
          message: "شما یک آزمون ناتمام دارید"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Create new attempt
    const attemptNumber = attemptCount + 1;
    const attempt = new Attempt({
      quiz: quiz._id,
      user: userId,
      service: quiz.service,
      startTime: new Date(),
      lastActivity: new Date(),
      attemptNumber,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown"
    });
    
    await attempt.save();
    
    console.log(`✅ New attempt created for quiz ${quiz.title}, attempt #${attemptNumber}`);
    
    return new Response(
      JSON.stringify({
        attempt: {
          _id: attempt._id,
          startTime: attempt.startTime,
          timeLimit: quiz.timeLimit,
          totalQuestions: quiz.questions.length
        },
        message: "آزمون با موفقیت شروع شد"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error starting quiz:", error);
    return new Response(
      JSON.stringify({ error: "خطا در شروع آزمون" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}