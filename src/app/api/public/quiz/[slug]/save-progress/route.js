// app/api/public/quiz/[slug]/save-progress/route.js
import { connectDB } from "../../../../../../lib/db";
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
    const { answers, remainingTime } = await request.json();
    
    const attempt = await Attempt.findOne({
      quiz: slug,
      user: userId,
      status: { $in: ['in_progress', 'paused'] }
    });
    
    if (!attempt) {
      return new Response(
        JSON.stringify({ error: "آزمون فعالی یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Update answers
    if (answers && answers.length > 0) {
      for (const answer of answers) {
        const existingAnswerIndex = attempt.answers.findIndex(
          a => a.questionId === answer.questionId
        );
        
        if (existingAnswerIndex >= 0) {
          attempt.answers[existingAnswerIndex].userAnswer = answer.userAnswer;
          attempt.answers[existingAnswerIndex].answeredAt = new Date();
        } else {
          attempt.answers.push({
            questionId: answer.questionId,
            question: answer.question,
            userAnswer: answer.userAnswer,
            answeredAt: new Date()
          });
        }
      }
    }
    
    // Update remaining time if paused
    if (remainingTime !== undefined) {
      attempt.remainingTime = remainingTime;
      attempt.status = 'paused';
    }
    
    attempt.lastActivity = new Date();
    await attempt.save();
    
    return new Response(
      JSON.stringify({ message: "پیشرفت آزمون ذخیره شد" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error saving progress:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ذخیره پیشرفت" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}