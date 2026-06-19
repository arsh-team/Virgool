// app/api/school/student-scores/route.js
import { connectDB } from "../../../../lib/db";
import MonthlyScore from "../../../../models/MonthlyScore";
import Subject from "../../../../models/Subject";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";
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
    const studentId = searchParams.get("studentId");
    const schoolId = searchParams.get("schoolId");
    const academicYear = searchParams.get("academicYear") || "1404-1405";
    const monthNumber = searchParams.get("monthNumber");
    const semester = searchParams.get("semester");
    
    if (!studentId || !schoolId) {
      return Response.json({ error: "شناسه دانش‌آموز و مدرسه الزامی است" }, { status: 400 });
    }
    
    // Only admin/principal/teacher can view reports, or the student can view their own
    const isStaff = requestingUser.type === 'creator' || requestingUser.schoolRole === 'teacher';
    const isOwnData = studentId === auth.userId;
    if (!isStaff && !isOwnData) {
      return Response.json({ error: "شما دسترسی به این اطلاعات ندارید" }, { status: 403 });
    }
    
    // Verify the requesting user belongs to the specified school
    const isCreator = requestingUser.type === 'creator';
    const belongsToSchool = requestingUser.school?.toString() === schoolId;
    if (!isCreator && !belongsToSchool) {
      return Response.json({ error: "شما دسترسی به اطلاعات این مدرسه را ندارید" }, { status: 403 });
    }
    
    // دریافت اطلاعات دانش‌آموز
    const student = await User.findById(studentId)
      .populate("studentInfo.enrolledClass", "name grade");
    
    if (!student) {
      return Response.json({ error: "دانش‌آموز یافت نشد" }, { status: 404 });
    }

    // تعیین کلاس دانش‌آموز برای فیلتر کردن دروس مرتبط
    const enrolledClassObj = student.studentInfo?.enrolledClass;
    const enrolledClassId = enrolledClassObj ? (enrolledClassObj._id || enrolledClassObj) : null;

    // دریافت تنها دروس مرتبط با کلاس دانش‌آموز (نه همه دروس مدرسه)
    // اگر کلاسی ثبت نشده بود، همه دروس مدرسه نمایش داده می‌شوند
    const subjectQuery = {
      school: schoolId,
      isActive: true
    };
    if (enrolledClassId) {
      subjectQuery.classes = enrolledClassId;
    }

    const subjects = await Subject.find(subjectQuery).select("name code");
    
    // تعیین ماه‌های مورد نظر
    let monthNumbers = [];
    let reportType = "";
    
    if (monthNumber && parseInt(monthNumber) > 0) {
      monthNumbers = [parseInt(monthNumber)];
      reportType = "monthly";
    } else if (semester === "1") {
      monthNumbers = [1, 2, 3, 4];
      reportType = "semester1";
    } else if (semester === "2") {
      monthNumbers = [5, 6, 7, 8, 9];
      reportType = "semester2";
    } else {
      monthNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      reportType = "annual";
    }
    
    // دریافت نمرات
    const scores = await MonthlyScore.find({
      student: studentId,
      school: schoolId,
      academicYear: academicYear,
      monthNumber: { $in: monthNumbers }
    });
    
    // ساختاردهی نمرات
    const scoresBySubject = {};
    
    // مقداردهی اولیه برای هر درس
    for (const subject of subjects) {
      scoresBySubject[subject._id.toString()] = {
        _id: subject._id,
        name: subject.name,
        code: subject.code,
        scores: {}
      };
      
      for (const monthNum of monthNumbers) {
        scoresBySubject[subject._id.toString()].scores[monthNum] = {
          activity: null,
          exam: null,
          finalScore: null
        };
      }
    }
    
    // پر کردن نمرات موجود
    for (const score of scores) {
      const subjectId = score.subject.toString();
      const monthNum = score.monthNumber;
      
      if (scoresBySubject[subjectId]) {
        const activity = score.scores?.activity;
        const exam = score.scores?.exam;
        
        // محاسبه نمره نهایی
        let finalScore = null;
        const validScores = [];
        
        if (activity !== null && activity !== undefined && activity !== "") {
          validScores.push(Number(activity));
        }
        if (exam !== null && exam !== undefined && exam !== "") {
          validScores.push(Number(exam));
        }
        
        if (validScores.length > 0) {
          finalScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
          finalScore = Math.round(finalScore * 10) / 10;
        }
        
        scoresBySubject[subjectId].scores[monthNum] = {
          activity: activity !== null && activity !== "" ? Number(activity) : null,
          exam: exam !== null && exam !== "" ? Number(exam) : null,
          finalScore: finalScore
        };
      }
    }
    
    // اگر گزارش ترم یا سالانه است، میانگین هر درس را محاسبه کن
    if (reportType !== "monthly") {
      const result = {};
      
      for (const [subjectId, subjectData] of Object.entries(scoresBySubject)) {
        let totalScore = 0;
        let count = 0;
        
        for (const monthNum of monthNumbers) {
          const monthScore = subjectData.scores[monthNum];
          if (monthScore.finalScore !== null && monthScore.finalScore > 0) {
            totalScore += monthScore.finalScore;
            count++;
          }
        }
        
        const average = count > 0 ? Math.round((totalScore / count) * 10) / 10 : null;
        
        result[subjectId] = {
          _id: subjectData._id,
          name: subjectData.name,
          code: subjectData.code,
          average: average,
          status: average ? (average >= 10 ? "passed" : "failed") : "no_data",
          totalScore: totalScore,
          count: count
        };
      }
      
      return Response.json({
        success: true,
        reportType: reportType,
        scores: result,
        student: {
          _id: student._id,
          firstname: student.firstname,
          lastname: student.lastname,
          phone: student.phone || "-",
          className: student.studentInfo?.enrolledClass?.name || "ثبت نشده",
          grade: student.studentInfo?.enrolledClass?.grade || "-"
        },
        academicYear: academicYear,
        monthNumbers: monthNumbers
      });
    }
    
    // گزارش ماهانه
    return Response.json({
      success: true,
      reportType: "monthly",
      scores: scoresBySubject,
      student: {
        _id: student._id,
        firstname: student.firstname,
        lastname: student.lastname,
        phone: student.phone || "-",
        className: student.studentInfo?.enrolledClass?.name || "ثبت نشده",
        grade: student.studentInfo?.enrolledClass?.grade || "-"
      },
      academicYear: academicYear,
      monthNumber: parseInt(monthNumber),
      monthName: getMonthName(parseInt(monthNumber))
    });
    
  } catch (error) {
    console.error("Error fetching student scores:", error);
    return Response.json({ 
      error: "خطا در دریافت کارنامه"
    }, { status: 500 });
  }
}

function getMonthName(monthNumber) {
  const months = {
    1: "مهر", 2: "آبان", 3: "آذر", 4: "دی",
    5: "بهمن", 6: "اسفند", 7: "فروردین", 8: "اردیبهشت", 9: "خرداد"
  };
  return months[monthNumber] || "";
}