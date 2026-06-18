// app/api/school/quizzes/[id]/route.js
import { connectDB } from "../../../../../lib/db";
import Quiz from "../../../../../models/Quiz";
import User from "../../../../../models/User";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";

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

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const resolvedParams = await params;
    const quizId = resolvedParams.id;
    const body = await request.json();
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return Response.json({ error: "آزمون یافت نشد" }, { status: 404 });
    }
    
    // Only admin/principal/teacher or quiz creator can update
    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser || (requestingUser.type !== 'creator' && requestingUser.schoolRole !== 'teacher' && quiz.createdBy?.toString() !== auth.userId)) {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    // Verify school ownership - user must belong to the school that owns this quiz
    const isCreator = requestingUser.type === 'creator';
    const belongsToSchool = requestingUser.school?.toString() === quiz.service?.toString();
    if (!isCreator && !belongsToSchool) {
      return Response.json({ error: "شما دسترسی به ویرایش آزمون این مدرسه را ندارید" }, { status: 403 });
    }
    
    // تابع کمکی برای پاک کردن IDهای موقت
    const cleanQuestions = (questions) => {
      if (!questions) return questions;
      
      return questions.map(q => {
        const cleanedQ = { ...q };
        
        if (cleanedQ._id && typeof cleanedQ._id === 'string' && cleanedQ._id.startsWith('temp-')) {
          delete cleanedQ._id;
        }
        
        if (cleanedQ.options && Array.isArray(cleanedQ.options)) {
          cleanedQ.options = cleanedQ.options.map(opt => {
            const cleanedOpt = { ...opt };
            if (cleanedOpt._id && typeof cleanedOpt._id === 'string' && cleanedOpt._id.startsWith('temp-')) {
              delete cleanedOpt._id;
            }
            return cleanedOpt;
          });
        }
        
        return cleanedQ;
      });
    };
    
    if (body.title !== undefined) quiz.title = body.title;
    if (body.description !== undefined) quiz.description = body.description;
    if (body.timeLimit !== undefined) quiz.timeLimit = body.timeLimit;
    if (body.passingScore !== undefined) quiz.passingScore = body.passingScore;
    if (body.maxAttempts !== undefined) quiz.maxAttempts = body.maxAttempts;
    if (body.isActive !== undefined) quiz.isActive = body.isActive;
    
    if (body.questions !== undefined) {
      const cleanedQuestions = cleanQuestions(body.questions);
      quiz.questions = cleanedQuestions;
    }
    
    if (body.startDate !== undefined) quiz.startDate = new Date(body.startDate);
    if (body.endDate !== undefined) quiz.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.showResults !== undefined) quiz.showResults = body.showResults;
    if (body.showCorrectAnswers !== undefined) quiz.showCorrectAnswers = body.showCorrectAnswers;
    if (body.showDetailedReport !== undefined) quiz.showDetailedReport = body.showDetailedReport;
    if (body.resultsReleased !== undefined) quiz.resultsReleased = body.resultsReleased;
    
    await quiz.save();
    
    return Response.json({ quiz, message: "آزمون با موفقیت بروزرسانی شد" });
  } catch (error) {
    console.error("Error updating quiz:", error);
    return Response.json({ error: "خطا در بروزرسانی آزمون" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const resolvedParams = await params;
    const quizId = resolvedParams.id;
    
    // Only admin/principal/teacher or quiz creator can delete
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return Response.json({ error: "آزمون یافت نشد" }, { status: 404 });
    }
    
    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser || (requestingUser.type !== 'creator' && requestingUser.schoolRole !== 'teacher' && quiz.createdBy?.toString() !== auth.userId)) {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    // Verify school ownership - user must belong to the school that owns this quiz
    const isCreator = requestingUser.type === 'creator';
    const belongsToSchool = requestingUser.school?.toString() === quiz.service?.toString();
    if (!isCreator && !belongsToSchool) {
      return Response.json({ error: "شما دسترسی به حذف آزمون این مدرسه را ندارید" }, { status: 403 });
    }
    
    const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
    if (!deletedQuiz) {
      return Response.json({ error: "آزمون یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ message: "آزمون با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return Response.json({ error: "خطا در حذف آزمون" }, { status: 500 });
  }
}