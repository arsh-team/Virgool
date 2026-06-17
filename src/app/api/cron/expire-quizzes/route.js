import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Attempt from "../../../../models/Attempt";

export const dynamic = "force-dynamic";

async function expireQuizAttempts() {
  await connectDB();
  const now = new Date();

  // Include both in_progress and paused attempts
  const activeAttempts = await Attempt.find({
    status: { $in: ['in_progress', 'paused'] },
    startTime: { $lte: now }
  }).populate('quiz');

  let expiredCount = 0;

  for (const attempt of activeAttempts) {
    const quiz = attempt.quiz;
    if (!quiz) continue;

    const timeLimitSeconds = quiz.timeLimit * 60;
    let isExpired = false;

    if (attempt.status === 'paused' && attempt.remainingTime !== undefined) {
      // For paused attempts, check if the remainingTime has also elapsed since the last update
      const lastActivity = new Date(attempt.lastActivity || attempt.updatedAt || attempt.startTime);
      const elapsedSincePause = Math.floor((now - lastActivity) / 1000);
      isExpired = attempt.remainingTime <= elapsedSincePause;
    } else {
      // For in_progress attempts, calculate from start time
      const startTime = new Date(attempt.startTime);
      const elapsedSeconds = Math.floor((now - startTime) / 1000);
      isExpired = elapsedSeconds >= timeLimitSeconds;
    }

    if (isExpired) {
      let earnedPoints = 0;
      let totalPoints = 0;

      if (attempt.answers && attempt.answers.length > 0) {
        const questionsMap = new Map();
        quiz.questions.forEach(q => {
          questionsMap.set(q._id.toString(), q);
          totalPoints += q.points || 1;
        });
        for (const answer of attempt.answers) {
          const question = questionsMap.get(answer.questionId);
          if (question) {
            // Re-evaluate correctness instead of trusting stored value
            let isCorrect = false;
            if (question.type === 'short_answer') {
              isCorrect = answer.userAnswer && question.correctAnswer && 
                answer.userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
            } else if (question.options) {
              const correctOption = question.options.find(o => o.isCorrect);
              isCorrect = correctOption && answer.userAnswer === correctOption.text;
            }
            if (isCorrect) {
              earnedPoints += question.points || 1;
            }
          }
        }
      } else {
        quiz.questions.forEach(q => {
          totalPoints += q.points || 1;
        });
      }

      const percentage = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed = percentage >= quiz.passingScore;

      attempt.status = 'expired';
      attempt.endTime = now;
      attempt.timeSpent = timeLimitSeconds;
      attempt.score = earnedPoints;
      attempt.percentage = percentage;
      attempt.passed = passed;

      await attempt.save();
      expiredCount++;
    }
  }

  return { expiredCount };
}

export async function POST(request) {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not set. Cron endpoint is disabled for security.");
    return NextResponse.json({ error: "Cron endpoint not configured" }, { status: 503 });
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await expireQuizAttempts();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Cron expire-quizzes failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}