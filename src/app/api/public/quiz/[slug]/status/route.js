// app/api/public/quiz/[slug]/status/route.js - نسخه جدید با بررسی startDate
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

export async function GET(request, { params }) {
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
    
    const now = new Date();
    
    // بررسی زمان شروع آزمون
    if (now < quiz.startDate) {
      return new Response(
        JSON.stringify({
          status: 'not_started',
          startDate: quiz.startDate,
          remainingTime: quiz.startDate.getTime() - now.getTime(),
          message: "آزمون هنوز شروع نشده است"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // بررسی زمان پایان آزمون
    if (quiz.endDate && now > quiz.endDate) {
      return new Response(
        JSON.stringify({
          status: 'ended',
          endDate: quiz.endDate,
          message: "زمان آزمون به پایان رسیده است"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // بررسی تلاش کامل شده قبلی (فقط یک بار مجاز است)
    const completedAttempt = await Attempt.findOne({
      quiz: quiz._id,
      user: userId,
      status: 'completed'
    });
    
    if (completedAttempt) {
      // بررسی مجوز نمایش نتایج
      let canViewResults = false;
      let canViewCorrectAnswers = false;
      
      switch (quiz.showResults) {
        case 'immediately':
          canViewResults = true;
          canViewCorrectAnswers = quiz.showCorrectAnswers;
          break;
        case 'after_deadline':
          canViewResults = quiz.endDate && now > quiz.endDate;
          canViewCorrectAnswers = canViewResults && quiz.showCorrectAnswers;
          break;
        case 'manual':
          canViewResults = quiz.resultsReleased;
          canViewCorrectAnswers = canViewResults && quiz.showCorrectAnswers;
          break;
      }
      
      return new Response(
        JSON.stringify({
          status: 'completed',
          hasCompletedAttempt: true,
          completedAttempt: {
            score: completedAttempt.score,
            percentage: completedAttempt.percentage,
            passed: completedAttempt.passed,
            completedAt: completedAttempt.endTime
          },
          canViewResults,
          canViewCorrectAnswers,
          resultsReleaseDate: quiz.showResults === 'after_deadline' ? quiz.endDate : null,
          message: "شما قبلاً در این آزمون شرکت کرده‌اید"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // بررسی تلاش در حال انجام
    const attempt = await Attempt.findOne({
      quiz: quiz._id,
      user: userId,
      status: { $in: ['in_progress', 'paused'] }
    });
    
    if (!attempt) {
      return new Response(
        JSON.stringify({ 
          status: 'ready',
          hasActiveAttempt: false,
          canStart: true,
          message: "آماده شروع آزمون"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const startTime = new Date(attempt.startTime);
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const timeLimitSeconds = quiz.timeLimit * 60;
    const remainingSeconds = Math.max(0, timeLimitSeconds - elapsedSeconds);
    const isExpired = remainingSeconds === 0;
    
    if (isExpired && attempt.status === 'in_progress') {
      attempt.status = 'expired';
      attempt.endTime = now;
      attempt.timeSpent = timeLimitSeconds;
      await attempt.save();
      
      return new Response(
        JSON.stringify({
          status: 'expired',
          hasActiveAttempt: false,
          expired: true,
          message: "زمان آزمون به پایان رسیده است"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({
        quizStatus: 'in_progress',
        hasActiveAttempt: true,
        attemptId: attempt._id,
        startTime: attempt.startTime,
        elapsedSeconds: elapsedSeconds,
        remainingSeconds: remainingSeconds,
        timeLimitSeconds: timeLimitSeconds,
        status: attempt.status,
        answersCount: attempt.answers.length,
        totalQuestions: quiz.questions.length
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking quiz status:", error);
    return new Response(
      JSON.stringify({ error: "خطا در بررسی وضعیت آزمون" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}