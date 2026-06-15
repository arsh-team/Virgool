import { NextResponse } from "next/server";
import { expireQuizAttempts } from "@/app/jobs/expire-quiz-attempts";

export const dynamic = "force-dynamic";

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
