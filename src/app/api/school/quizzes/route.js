// app/api/school/quizzes/route.js - نسخه اصلاح شده با فیلدهای جدید و فیلتر زمان
import { connectDB } from "../../../../lib/db";
import Quiz from "../../../../models/Quiz";
import Class from "../../../../models/Class";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { getJwtSecret } from "../../../../lib/auth";

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

// app/api/school/quizzes/route.js - قسمت GET را اصلاح کنید:

export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    let classId = searchParams.get("classId");
    
    if (!classId) {
      return Response.json({ error: "شناسه کلاس الزامی است" }, { status: 400 });
    }
    
    if (classId === '[object Object]') {
      console.error("Invalid classId received: [object Object]");
      return Response.json({ error: "شناسه کلاس نامعتبر است", quizzes: [] }, { status: 200 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(classId)) {
      return Response.json({ error: "شناسه کلاس معتبر الزامی است", quizzes: [] }, { status: 200 });
    }
    
    const classData = await Class.findById(classId);
    if (!classData) {
      return Response.json({ error: "کلاس یافت نشد", quizzes: [] }, { status: 200 });
    }
    
    const now = new Date();
    
    // دریافت تمام آزمون‌های کلاس
    const quizzes = await Quiz.find({ 
      classId: new mongoose.Types.ObjectId(classId),
      service: classData.school
    }).lean();
    
    // افزودن وضعیت آزمون به هر آزمون
    const quizzesWithStatus = quizzes.map(quiz => {
      const isExpired = quiz.endDate && new Date(quiz.endDate) < now;
      const isNotStarted = quiz.startDate && new Date(quiz.startDate) > now;
      
      return {
        ...quiz,
        quizStatus: {
          isExpired,
          isNotStarted,
          isActive: quiz.isActive && !isExpired,
          startDate: quiz.startDate,
          endDate: quiz.endDate,
          canStart: !isNotStarted && !isExpired && quiz.isActive
        }
      };
    });
    
    return Response.json({ quizzes: quizzesWithStatus });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return Response.json({ error: "خطا در دریافت آزمون‌ها", quizzes: [] }, { status: 200 });
  }
}
export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser || (requestingUser.type !== 'creator' && requestingUser.schoolRole !== 'teacher')) {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    const body = await request.json();
    const { 
      title, description, timeLimit, passingScore, _maxAttempts, isActive, classId,
      startDate, endDate, showResults, showCorrectAnswers, showDetailedReport 
    } = body;
    
    if (!classId || !mongoose.Types.ObjectId.isValid(classId)) {
      return Response.json({ error: "شناسه کلاس معتبر الزامی است" }, { status: 400 });
    }
    
    if (!title || title.trim() === "") {
      return Response.json({ error: "عنوان آزمون الزامی است" }, { status: 400 });
    }
    
    const classData = await Class.findById(classId);
    if (!classData) {
      return Response.json({ error: "کلاس یافت نشد" }, { status: 404 });
    }
    
    const quiz = new Quiz({
      title: title.trim(),
      description: description || "",
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 70,
      maxAttempts: 1, // هر کاربر فقط یک بار می‌تواند شرکت کند
      isActive: isActive !== undefined ? isActive : true,
      classId: new mongoose.Types.ObjectId(classId),
      service: classData.school,
      createdBy: new mongoose.Types.ObjectId(auth.userId),
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      showResults: showResults || 'immediately',
      showCorrectAnswers: showCorrectAnswers !== undefined ? showCorrectAnswers : true,
      showDetailedReport: showDetailedReport !== undefined ? showDetailedReport : true,
      resultsReleased: false
    });
    
    await quiz.save();
    
    return Response.json({ quiz, message: "آزمون با موفقیت ایجاد شد" }, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return Response.json({ error: "خطا در ایجاد آزمون" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser || (requestingUser.type !== 'creator' && requestingUser.schoolRole !== 'teacher')) {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");
    const body = await request.json();
    
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return Response.json({ error: "شناسه آزمون نامعتبر است" }, { status: 400 });
    }
    
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return Response.json({ error: "آزمون یافت نشد" }, { status: 404 });
    }
    
    // بروزرسانی فیلدها
    if (body.title !== undefined) quiz.title = body.title;
    if (body.description !== undefined) quiz.description = body.description;
    if (body.timeLimit !== undefined) quiz.timeLimit = body.timeLimit;
    if (body.passingScore !== undefined) quiz.passingScore = body.passingScore;
    if (body.maxAttempts !== undefined) quiz.maxAttempts = body.maxAttempts;
    if (body.isActive !== undefined) quiz.isActive = body.isActive;
    if (body.questions !== undefined) quiz.questions = body.questions;
    
    // فیلدهای جدید
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

export async function DELETE(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser || (requestingUser.type !== 'creator' && requestingUser.schoolRole !== 'teacher')) {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get("id");
    
    if (!quizId || !mongoose.Types.ObjectId.isValid(quizId)) {
      return Response.json({ error: "شناسه آزمون نامعتبر است" }, { status: 400 });
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