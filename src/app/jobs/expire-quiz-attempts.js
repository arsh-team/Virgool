// jobs/expire-quiz-attempts.js
import { connectDB } from "@/lib/db";
import Attempt from "@/models/Attempt";

export async function expireQuizAttempts() {
  try {
    await connectDB();
    
    const now = new Date();
    
    // Find all active attempts
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
        // Calculate final score based on existing answers
        let earnedPoints = 0;
        let totalPoints = 0;
        
        if (attempt.answers && attempt.answers.length > 0) {
          // Re-calculate score
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
          // If no answers, calculate total points from quiz
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
    
    console.log(`Expired ${expiredCount} quiz attempts`);
    return { expiredCount };
  } catch (error) {
    console.error("Error expiring quiz attempts:", error);
    throw error;
  }
}

