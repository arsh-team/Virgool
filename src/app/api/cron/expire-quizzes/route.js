import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/db";
import Attempt from "../../../../models/Attempt";

export const dynamic = "force-dynamic";

async function expireQuizAttempts() {
  await connectDB();
  const now = new Date();

  const activeAttempts = await Attempt.find({
    status: 'in_progress',
    startTime: { $lte: now }
  }).populate('quiz');

  let expiredCount = 0;

  for (const attempt of activeAttempts) {
    const quiz = attempt.quiz;
    if (!quiz) continue;

    const startTime = new Date(attempt.startTime);
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const timeLimitSeconds = quiz.timeLimit * 60;

    if (elapsedSeconds >= timeLimitSeconds) {
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
          if (question && answer.isCorrect) {
            earnedPoints += question.points || 1;
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
  if (process.env.CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await expireQuizAttempts();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Cron expire-quizzes failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
