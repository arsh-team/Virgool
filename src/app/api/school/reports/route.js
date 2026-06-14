// app/api/school/reports/route.js
import { connectDB } from "../../../../lib/db";
import MonthlyScore from "../../../../models/MonthlyScore";
import Discipline from "../../../../models/Discipline";
import User from "../../../../models/User";
import Class from "../../../../models/Class";
import Subject from "../../../../models/Subject";
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

export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser) {
      return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }
    
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get("type"); // monthly, semester1, semester2, annual
    const studentId = searchParams.get("studentId");
    const schoolId = searchParams.get("schoolId");
    const classId = searchParams.get("classId");
    const monthNumber = searchParams.get("monthNumber");
    const academicYear = searchParams.get("academicYear");
    
    if (!studentId || !schoolId) {
      return Response.json({ error: "شناسه دانش‌آموز و مدرسه الزامی است" }, { status: 400 });
    }
    
    // Only admin/principal/teacher can view reports, or the student can view their own
    const isStaff = requestingUser.type === 'creator' || requestingUser.schoolRole === 'teacher';
    const isOwnData = studentId === auth.userId;
    if (!isStaff && !isOwnData) {
      return Response.json({ error: "شما دسترسی به این اطلاعات ندارید" }, { status: 403 });
    }
    
    // Fetch student info
    const student = await User.findById(studentId).select("firstname lastname phone studentInfo");
    const studentClass = await Class.findById(student.studentInfo?.enrolledClass);
    
    // Fetch all subjects for this school
    const subjects = await Subject.find({ school: schoolId });
    
    // Fetch scores based on report type
    let monthNumbers = [];
    if (reportType === "monthly" && monthNumber) {
      monthNumbers = [parseInt(monthNumber)];
    } else if (reportType === "semester1") {
      monthNumbers = [1, 2, 3, 4]; // مهر, آبان, آذر, دی
    } else if (reportType === "semester2") {
      monthNumbers = [5, 6, 7, 8, 9]; // بهمن, اسفند, فروردین, اردیبهشت, خرداد
    } else if (reportType === "annual") {
      monthNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }
    
    const scores = await MonthlyScore.find({
      student: studentId,
      school: schoolId,
      academicYear: academicYear || "1404-1405",
      monthNumber: { $in: monthNumbers }
    });
    
    // Calculate report data
    const reportData = {
      student: {
        name: `${student.firstname} ${student.lastname}`,
        phone: student.phone,
        className: studentClass?.name,
        grade: studentClass?.grade
      },
      academicYear: academicYear || "1404-1405",
      reportType,
      subjects: [],
      summary: {
        totalAverage: 0,
      }
    };
    
    let overallScores = [];
    
    for (const subject of subjects) {
      const subjectScores = scores.filter(s => s.subject.toString() === subject._id.toString());
      
      let subjectData = {
        name: subject.name,
        code: subject.code,
        months: [],
        average: 0
      };
      
      let subjectTotal = 0;
      let scoreCount = 0;
      
      for (const monthNum of monthNumbers) {
        const monthScore = subjectScores.find(s => s.monthNumber === monthNum);
        const monthAvg = monthScore?.average || 0;
        subjectData.months.push({
          month: getMonthName(monthNum),
          monthNumber: monthNum,
          average: monthAvg,
          exam: monthScore?.scores?.exam || 0,
          activity: monthScore?.scores?.activity || 0
        });
        
        if (monthAvg > 0) {
          subjectTotal += monthAvg;
          scoreCount++;
          overallScores.push(monthAvg);
        }
      }
      
      subjectData.average = scoreCount > 0 ? subjectTotal / scoreCount : 0;
      reportData.subjects.push(subjectData);
    }
    
    reportData.summary.totalAverage = overallScores.length > 0 
      ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length 
      : 0;
    
    // Fetch discipline records
    const disciplines = await Discipline.find({
      student: studentId,
      school: schoolId
    }).sort({ date: -1 }).limit(10);
    
    reportData.disciplines = disciplines.map(d => ({
      title: d.title,
      description: d.description,
      type: d.type,
      date: d.date,
      isResolved: d.isResolved
    }));
    
    return Response.json({ report: reportData });
  } catch (error) {
    console.error("Error generating report:", error);
    return Response.json({ error: "خطا در تولید گزارش" }, { status: 500 });
  }
}

function getMonthName(monthNumber) {
  const months = {
    1: "مهر", 2: "آبان", 3: "آذر", 4: "دی",
    5: "بهمن", 6: "اسفند", 7: "فروردین", 8: "اردیبهشت", 9: "خرداد"
  };
  return months[monthNumber] || "";
}