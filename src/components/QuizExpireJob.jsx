'use client';

import { useEffect } from 'react';

// NOTE: Quiz expiration should be handled server-side via a proper cron service,
// not from client browsers. This component has been disabled to prevent DDoS.
// See /api/cron/expire-quizzes for server-side implementation.
export default function QuizExpireJob() {
  // Disabled - cron jobs should not be triggered from client-side
  return null;
}
