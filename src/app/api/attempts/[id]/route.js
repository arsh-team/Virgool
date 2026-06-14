// app/api/attempts/[id]/route.js
import { connectDB } from "../../../../lib/db";
import Attempt from "../../../../models/Attempt";
import Service from "../../../../models/Service";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر است" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const resolvedParams = await params;
    const attemptId = resolvedParams.id;
    
    const attempt = await Attempt.findById(attemptId)
      .populate('user', 'firstname lastname email phone')
      .populate('quiz', 'title passingScore timeLimit questions');
    
    if (!attempt) {
      return new Response(
        JSON.stringify({ error: "تلاش یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check service ownership or attempt ownership
    const service = await Service.findById(attempt.service);
    const isServiceOwner = service && service.fromUserId && service.fromUserId.toString() === decoded.id;
    const isAttemptOwner = attempt.user && attempt.user.toString() === decoded.id;
    if (!isServiceOwner && !isAttemptOwner) {
      return new Response(
        JSON.stringify({ error: "شما دسترسی به این اطلاعات ندارید" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Prepare detailed answers with question info
    const detailedAnswers = [];
    if (attempt.quiz && attempt.quiz.questions) {
      const questionsMap = new Map();
      attempt.quiz.questions.forEach(q => {
        questionsMap.set(q._id.toString(), q);
      });
      
      for (const answer of attempt.answers) {
        const question = questionsMap.get(answer.questionId);
        if (question) {
          detailedAnswers.push({
            question: question.question,
            type: question.type,
            points: question.points,
            userAnswer: answer.userAnswer,
            isCorrect: answer.isCorrect,
            pointsEarned: answer.pointsEarned,
            correctAnswer: question.type === 'short_answer' ? question.correctAnswer : 
              question.options?.find(o => o.isCorrect)?.text,
            options: question.type !== 'short_answer' ? question.options?.map(o => ({
              text: o.text,
              isCorrect: o.isCorrect
            })) : undefined
          });
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        attempt: {
          _id: attempt._id,
          startTime: attempt.startTime,
          endTime: attempt.endTime,
          timeSpent: attempt.timeSpent,
          score: attempt.score,
          percentage: attempt.percentage,
          passed: attempt.passed,
          status: attempt.status,
          attemptNumber: attempt.attemptNumber
        },
        user: attempt.user,
        quiz: {
          title: attempt.quiz?.title,
          passingScore: attempt.quiz?.passingScore,
          timeLimit: attempt.quiz?.timeLimit
        },
        answers: detailedAnswers
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching attempt details:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت جزئیات" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}