// app/api/public/quiz/[slug]/submit/route.js
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

function checkAnswer(question, userAnswer) {
  if (!userAnswer) return false;
  
  if (question.type === 'multiple_choice') {
    const correctOption = question.options?.find(opt => opt.isCorrect);
    return userAnswer === correctOption?._id?.toString();
  } else if (question.type === 'true_false') {
    const correctOption = question.options?.find(opt => opt.isCorrect);
    return userAnswer === correctOption?._id?.toString();
  } else if (question.type === 'short_answer') {
    if (!question.correctAnswer) return false;
    return userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
  }
  return false;
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
    
    // دریافت بدنه با بررسی خالی بودن
    let body;
    try {
      const text = await request.text();
      if (!text || text.trim() === '') {
        return new Response(
          JSON.stringify({ error: "بدنه درخواست خالی است" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      body = JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({ error: "فرمت داده ارسالی نامعتبر است" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { answers, isAutoSubmit: clientAutoSubmit = false } = body;
    
    if (!answers || !Array.isArray(answers)) {
      return new Response(
        JSON.stringify({ error: "پاسخ‌ها ارسال نشده است" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
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
      status: { $in: ['in_progress', 'paused'] }
    });
    
    if (!attempt) {
      return new Response(
        JSON.stringify({ error: "آزمون فعالی یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Calculate time spent
    const now = new Date();
    const startTime = new Date(attempt.startTime);
    let timeSpent = Math.floor((now - startTime) / 1000);
    
    // Check if time limit exceeded
    const timeLimitSeconds = quiz.timeLimit * 60;
    const isExpired = timeSpent > timeLimitSeconds;
    
    const isAutoSubmit = isExpired || clientAutoSubmit;
    
    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const answerResults = [];
    
    // Create a map of questions by ID for easy lookup
    const questionsMap = new Map();
    quiz.questions.forEach(q => {
      questionsMap.set(q._id.toString(), q);
      totalPoints += q.points || 1;
    });
    
    // Process each answer
    for (const answer of answers) {
      const question = questionsMap.get(answer.questionId);
      if (!question) continue;
      
      const isCorrect = checkAnswer(question, answer.userAnswer);
      const pointsEarned = isCorrect ? (question.points || 1) : 0;
      earnedPoints += pointsEarned;
      
      answerResults.push({
        questionId: answer.questionId,
        question: question.question,
        userAnswer: answer.userAnswer,
        isCorrect,
        pointsEarned,
        answeredAt: new Date()
      });
    }
    
    const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentage >= quiz.passingScore;
    
    // Update attempt
    attempt.answers = answerResults;
    attempt.score = earnedPoints;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = 'completed';
    attempt.endTime = now;
    attempt.timeSpent = Math.min(timeSpent, timeLimitSeconds);
    
    await attempt.save();
    
    return new Response(
      JSON.stringify({
        attemptId: attempt._id,
        score: earnedPoints,
        totalPoints: totalPoints,
        percentage: percentage,
        passed: passed,
        passingScore: quiz.passingScore,
        timeSpent: attempt.timeSpent,
        correctCount: answerResults.filter(a => a.isCorrect).length,
        wrongCount: answerResults.filter(a => !a.isCorrect).length,
        message: "آزمون با موفقیت ثبت شد"
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ثبت پاسخ‌ها" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}