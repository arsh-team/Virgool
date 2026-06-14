// app/api/public/quiz/[slug]/route.js
import { connectDB } from "../../../../../lib/db";
import Quiz from "../../../../../models/Quiz";
import Attempt from "../../../../../models/Attempt";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";

async function getUserIdFromToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return decoded.id;
  } catch {
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const { slug } = await params;
    const userId = await getUserIdFromToken(request);
    
    console.log("🔍 Fetching quiz with ID:", slug);
    
    // Find quiz by ID (slug is the quiz ID)
    const quiz = await Quiz.findById(slug);
    
    if (!quiz) {
      console.log("❌ Quiz not found");
      return new Response(
        JSON.stringify({ error: "آزمون یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    console.log("✅ Quiz found:", quiz.title);
    console.log("📊 Questions count:", quiz.questions?.length || 0);
    
    const now = new Date();
    const isExpired = quiz.endDate && new Date(quiz.endDate) < now;
    const isNotStarted = quiz.startDate && new Date(quiz.startDate) > now;
    
    let existingAttempt = null;
    let attempts = [];
    let canTakeQuiz = true;
    let remainingAttempts = quiz.maxAttempts;
    let hasCompletedAttempt = false;
    let completedAttemptData = null;
    
    if (userId) {
      // Get completed attempts for THIS quiz only
      const completedAttempts = await Attempt.find({
        quiz: quiz._id,
        user: userId,
        status: { $in: ['completed', 'expired'] }
      }).sort({ createdAt: -1 });
      
      attempts = completedAttempts;
      const completedCount = completedAttempts.filter(a => a.status === 'completed').length;
      remainingAttempts = Math.max(0, quiz.maxAttempts - completedCount);
      canTakeQuiz = remainingAttempts > 0;
      hasCompletedAttempt = completedCount > 0;
      
      if (hasCompletedAttempt) {
        const lastCompleted = completedAttempts.find(a => a.status === 'completed');
        if (lastCompleted) {
          completedAttemptData = {
            score: lastCompleted.score,
            percentage: lastCompleted.percentage,
            passed: lastCompleted.passed,
            completedAt: lastCompleted.endTime
          };
        }
      }
      
      // Check for in-progress attempt for THIS quiz only
      existingAttempt = await Attempt.findOne({
        quiz: quiz._id,
        user: userId,
        status: { $in: ['in_progress', 'paused'] }
      });
    }
    
    // بررسی شرایط نمایش نتایج
    let canViewResults = false;
    let canViewCorrectAnswers = false;
    
    if (hasCompletedAttempt) {
      switch (quiz.showResults) {
        case 'immediately':
          canViewResults = true;
          canViewCorrectAnswers = quiz.showCorrectAnswers;
          break;
        case 'after_deadline':
          canViewResults = quiz.endDate && now > new Date(quiz.endDate);
          canViewCorrectAnswers = canViewResults && quiz.showCorrectAnswers;
          break;
        case 'manual':
          canViewResults = quiz.resultsReleased || false;
          canViewCorrectAnswers = canViewResults && quiz.showCorrectAnswers;
          break;
        default:
          canViewResults = true;
          canViewCorrectAnswers = quiz.showCorrectAnswers;
      }
    }
    
    // Sanitize quiz data for client
    const sanitizedQuiz = {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      timeLimit: quiz.timeLimit,
      passingScore: quiz.passingScore,
      maxAttempts: quiz.maxAttempts,
      questionsCount: quiz.questions?.length || 0,
      isActive: quiz.isActive && !isExpired,
      // فیلدهای جدید
      startDate: quiz.startDate,
      endDate: quiz.endDate,
      showResults: quiz.showResults,
      showCorrectAnswers: quiz.showCorrectAnswers,
      showDetailedReport: quiz.showDetailedReport,
      resultsReleased: quiz.resultsReleased,
      // وضعیت آزمون - اینجا اضافه می‌کنیم تا فرانت بتونه استفاده کنه
      quizStatus: {
        isExpired,
        isNotStarted,
        canStart: !isNotStarted && !isExpired && quiz.isActive,
        status: isNotStarted ? 'not_started' : (isExpired ? 'expired' : 'active')
      },
      questions: userId ? (quiz.questions || []).map((q, index) => ({
        _id: q._id?.toString() || `q_${index}`,
        question: q.question,
        type: q.type,
        points: q.points || 1,
        order: q.order || index,
        explanation: q.explanation,
        options: q.type !== 'short_answer' ? (q.options || []).map(opt => ({
          _id: opt._id?.toString(),
          text: opt.text
        })) : undefined
      })) : undefined
    };
    
    const responseData = {
      quiz: sanitizedQuiz,
      attempts: attempts.map(a => ({
        _id: a._id,
        score: a.score,
        percentage: a.percentage,
        passed: a.passed,
        completedAt: a.endTime,
        status: a.status
      })),
      canTakeQuiz,
      remainingAttempts,
      // اضافه کردن فیلدهای status برای هماهنگی با fetchQuizData
      status: isNotStarted ? 'not_started' : (hasCompletedAttempt ? 'completed' : (existingAttempt ? 'in_progress' : 'ready')),
      hasCompletedAttempt,
      completedAttempt: completedAttemptData,
      canViewResults,
      canViewCorrectAnswers,
      startDate: quiz.startDate,
      endDate: quiz.endDate
    };
    
    if (existingAttempt) {
      responseData.existingAttempt = {
        _id: existingAttempt._id,
        status: existingAttempt.status,
        startTime: existingAttempt.startTime,
        remainingTime: existingAttempt.remainingTime,
        answers: existingAttempt.answers,
        timeSpent: existingAttempt.timeSpent
      };
    }
    
    console.log("📦 Sending response with:", {
      quizId: sanitizedQuiz._id,
      questionsCount: sanitizedQuiz.questionsCount,
      hasExistingAttempt: !!existingAttempt,
      remainingAttempts,
      status: responseData.status,
      hasCompletedAttempt
    });
    
    return new Response(
      JSON.stringify(responseData),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Error fetching quiz:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت اطلاعات آزمون" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}