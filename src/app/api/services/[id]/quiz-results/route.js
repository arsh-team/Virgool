// app/api/services/[id]/quiz-results/route.js
import { connectDB } from "../../../../../lib/db";
import Attempt from "../../../../../models/Attempt";
import Quiz from "../../../../../models/Quiz";
import Service from "../../../../../models/Service";
import User from "../../../../../models/User";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";

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
    const serviceId = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('quizId');
    
    // Check service ownership
    const service = await Service.findById(serviceId).populate('fromUserId');
    if (!service) {
      return new Response(
        JSON.stringify({ error: "خدمت یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const isOwner = service.fromUserId && service.fromUserId._id.toString() === decoded.id;
    if (!isOwner) {
      return new Response(
        JSON.stringify({ error: "شما دسترسی به این خدمت ندارید" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Build query
    let query = { service: serviceId };
    if (quizId) {
      query.quiz = quizId;
    } else {
      const quizzes = await Quiz.find({ service: serviceId }).select('_id');
      query.quiz = { $in: quizzes.map(q => q._id) };
    }
    
    query.status = { $in: ['completed', 'expired'] };
    
    const attempts = await Attempt.find(query)
      .populate('user', 'firstname lastname')
      .populate('quiz', 'title passingScore timeLimit')
      .sort({ createdAt: -1 });
    
    // Calculate statistics
    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter(a => a.passed).length;
    const averageScore = totalAttempts > 0 
      ? attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / totalAttempts 
      : 0;
    
    // Group by quiz
    const quizStats = {};
    attempts.forEach(attempt => {
      const quizTitle = attempt.quiz?.title || 'نامشخص';
      if (!quizStats[quizTitle]) {
        quizStats[quizTitle] = {
          title: quizTitle,
          total: 0,
          passed: 0,
          avgScore: 0
        };
      }
      quizStats[quizTitle].total++;
      if (attempt.passed) quizStats[quizTitle].passed++;
      quizStats[quizTitle].avgScore = (quizStats[quizTitle].avgScore * (quizStats[quizTitle].total - 1) + (attempt.percentage || 0)) / quizStats[quizTitle].total;
    });
    
    return new Response(
      JSON.stringify({
        attempts,
        stats: {
          totalAttempts,
          passedAttempts,
          failedAttempts: totalAttempts - passedAttempts,
          averageScore: averageScore.toFixed(1),
          passRate: totalAttempts > 0 ? ((passedAttempts / totalAttempts) * 100).toFixed(1) : 0
        },
        quizStats: Object.values(quizStats)
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت نتایج آزمون" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}