"use client";

import { useEffect } from "react";

export default function QuizExpireJob() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await fetch("/api/cron/expire-quizzes", { method: "POST" });
      } catch {}
    }, 60000);
    return () => clearInterval(interval);
  }, []);
  return null;
}
