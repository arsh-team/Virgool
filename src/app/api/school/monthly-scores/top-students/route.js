// app/api/school/monthly-scores/top-students/route.js
import { connectDB } from "../../../../../lib/db";
import MonthlyScore from "../../../../../models/MonthlyScore";
import Class from "../../../../../models/Class";
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

export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const academicYear = searchParams.get("academicYear");
    const scope = searchParams.get("scope") || "school";
    const classId = searchParams.get("classId");
    const grade = searchParams.get("grade");
    const limit = parseInt(searchParams.get("limit")) || 3;
    
    if (!schoolId || !academicYear) {
      return Response.json({ error: "پارامترهای schoolId و academicYear الزامی هستند" }, { status: 400 });
    }
    
    let query = {
      school: schoolId,
      academicYear: academicYear
    };
    
    if (scope === "class" && classId) {
      query.class = classId;
    } else if (scope === "grade" && grade) {
      const classesInGrade = await Class.find({ 
        school: schoolId, 
        grade: grade,
        isActive: true 
      }).distinct("_id");
      
      if (classesInGrade.length === 0) {
        return Response.json({ topStudents: [], message: "هیچ کلاسی در این پایه یافت نشد" });
      }
      
      query.class = { $in: classesInGrade };
    }
    
    const scores = await MonthlyScore.find(query)
      .populate("student", "firstname lastname email")
      .populate("class", "name grade")
      .populate("subject", "name code");
    
    if (scores.length === 0) {
      return Response.json({ topStudents: [], message: "هیچ نمره‌ای یافت نشد" });
    }
    
    const studentScores = {};
    
    scores.forEach(score => {
      const studentId = score.student?._id?.toString();
      if (!studentId) return;
      
      const activity = score.scores?.activity;
      const exam = score.scores?.exam;
      
      const validScores = [activity, exam].filter(v => v !== null && v !== undefined && v !== "" && !isNaN(v)).map(Number);
      const entryAverage = validScores.length > 0 ? validScores.reduce((a, b) => a + b, 0) / validScores.length : null;
      
      if (entryAverage === null) return;
      
      if (!studentScores[studentId]) {
        studentScores[studentId] = {
          student: score.student,
          class: score.class,
          scores: [],
          totalSum: 0,
          count: 0,
          bestScore: 0
        };
      }
      
      studentScores[studentId].scores.push(entryAverage);
      studentScores[studentId].totalSum += entryAverage;
      studentScores[studentId].count += 1;
      
      if (entryAverage > studentScores[studentId].bestScore) {
        studentScores[studentId].bestScore = entryAverage;
      }
    });
    
    const result = Object.values(studentScores).map(data => ({
      _id: data.student._id,
      firstname: data.student.firstname,
      lastname: data.student.lastname,
      email: data.student.email,
      studentInfo: {
        enrolledClass: data.class
      },
      totalAverage: data.count > 0 ? Math.round((data.totalSum / data.count) * 100) / 100 : 0,
      bestScore: data.bestScore,
      scoreCount: data.count
    }));
    
    result.sort((a, b) => b.totalAverage - a.totalAverage);
    
    let topStudents = [];
    if (result.length > 0) {
      topStudents = result.slice(0, limit);
    }
    
    return Response.json({ 
      topStudents,
      totalCount: result.length,
      scope,
      generatedAt: new Date()
    });
    
  } catch (error) {
    console.error("Error fetching top students:", error);
    return Response.json({ error: "خطا در دریافت نفرات برتر" }, { status: 500 });
  }
}
