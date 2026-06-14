// app/api/public/quiz/[slug]/results/route.js
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
    
    const attempt = await Attempt.findOne({
      quiz: quiz._id,
      user: userId,
      status: 'completed'
    });
    
    if (!attempt) {
      return new Response(
        JSON.stringify({ 
          canView: false,
          message: "شما هنوز در این آزمون شرکت نکرده‌اید" 
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const now = new Date();
    let canViewResults = false;
    let canViewCorrectAnswers = false;
    
    // بررسی شرایط نمایش نتایج
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
        canViewResults = quiz.resultsReleased || false;
        canViewCorrectAnswers = canViewResults && quiz.showCorrectAnswers;
        break;
    }
    
    if (!canViewResults) {
      return new Response(
        JSON.stringify({
          canView: false,
          message: "نتایج این آزمون هنوز منتشر نشده است",
          releaseDate: quiz.showResults === 'after_deadline' ? quiz.endDate : null
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // محاسبه پاسخ‌های تفکیکی
    const detailedAnswers = quiz.questions.map((question, _idx) => {
      const userAnswer = attempt.answers.find(a => a.questionId === question._id?.toString());
      
      let isCorrect = false;
      let correctAnswerText = "";
      
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const correctOption = question.options?.find(opt => opt.isCorrect);
        correctAnswerText = correctOption?.text || "";
        isCorrect = userAnswer?.userAnswer === correctOption?._id?.toString();
      } else if (question.type === 'short_answer') {
        correctAnswerText = question.correctAnswer || "";
        isCorrect = userAnswer?.userAnswer?.trim().toLowerCase() === correctAnswerText.trim().toLowerCase();
      }
      
      let userAnswerText = "";
      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        const selectedOption = question.options?.find(opt => opt._id?.toString() === userAnswer?.userAnswer);
        userAnswerText = selectedOption?.text || userAnswer?.userAnswer || "پاسخ داده نشده";
      } else {
        userAnswerText = userAnswer?.userAnswer || "پاسخ داده نشده";
      }
      
      return {
        questionId: question._id,
        questionText: question.question,
        userAnswer: userAnswerText,
        correctAnswer: canViewCorrectAnswers ? correctAnswerText : null,
        isCorrect: isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
        maxPoints: question.points,
        explanation: quiz.showDetailedReport ? question.explanation : null
      };
    });
    
    const totalPoints = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
    const earnedPoints = detailedAnswers.reduce((sum, a) => sum + a.pointsEarned, 0);
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;
    
    return new Response(
      JSON.stringify({
        canView: true,
        canViewCorrectAnswers,
        result: {
          score: earnedPoints,
          totalPoints: totalPoints,
          percentage: percentage,
          passed: passed,
          passingScore: quiz.passingScore,
          timeSpent: attempt.timeSpent || 0,
          completedAt: attempt.endTime,
          detailedAnswers: detailedAnswers,
          correctCount: detailedAnswers.filter(a => a.isCorrect).length,
          wrongCount: detailedAnswers.filter(a => !a.isCorrect).length
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching results:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت نتایج" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}