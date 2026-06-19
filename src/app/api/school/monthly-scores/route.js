// app/api/school/monthly-scores/route.js
import { connectDB } from "../../../../lib/db";
import MonthlyScore from "../../../../models/MonthlyScore";
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
    
    const isStaff = requestingUser.type === 'creator' || requestingUser.schoolRole === 'teacher';
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const classId = searchParams.get("classId");
    const subjectId = searchParams.get("subjectId");
    let studentId = searchParams.get("studentId");
    const monthNumber = searchParams.get("monthNumber");
    const academicYear = searchParams.get("academicYear");
    
    // Students can only see their own scores
    if (!isStaff) {
      studentId = auth.userId;
    }
    
    let query = {};
    if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) query.school = schoolId;
    if (classId && mongoose.Types.ObjectId.isValid(classId)) query.class = classId;
    if (subjectId && mongoose.Types.ObjectId.isValid(subjectId)) query.subject = subjectId;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) query.student = studentId;
    if (monthNumber) query.monthNumber = parseInt(monthNumber);
    if (academicYear) query.academicYear = academicYear;
    
    const scores = await MonthlyScore.find(query)
      .populate("student", "firstname lastname email phone")
      .populate("subject", "name code")
      .populate("class", "name grade")
      .populate("recordedBy", "firstname lastname")
      .lean();
    
    return Response.json({ scores });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return Response.json({ error: "خطا در دریافت نمرات" }, { status: 500 });
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
    console.log("📦 Received body in POST /api/school/monthly-scores:", body);
    
    const { scores } = body;
    
    if (!scores || !Array.isArray(scores)) {
      return Response.json({ error: "داده‌های نمرات نامعتبر است" }, { status: 400 });
    }
    
    const validScores = [];
    const errors = [];
    
    // Validate score range (0-20) for each score value
    function validateScoreRange(scoreValues) {
      if (!scoreValues || typeof scoreValues !== 'object') return true;
      for (const [key, value] of Object.entries(scoreValues)) {
        if (value !== null && value !== undefined && value !== '') {
          const numValue = Number(value);
          if (isNaN(numValue) || numValue < 0 || numValue > 20) {
            return false;
          }
        }
      }
      return true;
    }
    
    for (const scoreData of scores) {
      const { studentId, subjectId, classId, schoolId, academicYear, month, monthNumber, scoreValues, comment } = scoreData;
      
      if (!studentId || !subjectId || !classId || !schoolId || !academicYear || !monthNumber) {
        errors.push({ studentId, error: "فیلدهای الزامی ناقص هستند" });
        continue;
      }
      
      // Validate score range (0-20)
      if (scoreValues && !validateScoreRange(scoreValues)) {
        errors.push({ studentId, error: "نمرات باید بین ۰ تا ۲۰ باشند" });
        continue;
      }
      
      if (!mongoose.Types.ObjectId.isValid(studentId) || 
          !mongoose.Types.ObjectId.isValid(subjectId) || 
          !mongoose.Types.ObjectId.isValid(classId) || 
          !mongoose.Types.ObjectId.isValid(schoolId)) {
        errors.push({ studentId, error: "شناسه‌های ارسالی نامعتبر هستند" });
        continue;
      }
      
      // محاسبه میانگین نمرات (چون bulkWrite هوز pre-save را اجرا نمی‌کند)
      const scoreFields = ['oral', 'written', 'homework', 'activity', 'exam'];
      const validScoreValues = scoreFields
        .map(k => scoreValues?.[k])
        .filter(s => s !== null && s !== undefined && s !== '');
      let calculatedAverage = null;
      if (validScoreValues.length > 0) {
        const sum = validScoreValues.reduce((acc, val) => acc + Number(val), 0);
        calculatedAverage = Number((sum / validScoreValues.length).toFixed(2));
      }

      validScores.push({
        updateOne: {
          filter: {
            student: studentId,
            subject: subjectId,
            class: classId,
            academicYear,
            monthNumber: parseInt(monthNumber)
          },
          update: {
            $set: {
              scores: scoreValues || {},
              average: calculatedAverage,
              ...(comment !== undefined && { comment }),
              recordedBy: auth.userId,
              status: "completed"
            },
            $setOnInsert: {
              student: studentId,
              subject: subjectId,
              class: classId,
              school: schoolId,
              academicYear,
              month: month || `ماه ${monthNumber}`,
              monthNumber: parseInt(monthNumber)
            }
          },
          upsert: true
        }
      });
    }
    
    if (validScores.length > 0) {
      await MonthlyScore.bulkWrite(validScores, { ordered: false });
    }
    
    return Response.json({
      message: `${validScores.length} نمره با موفقیت ثبت شد`,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error saving scores:", error);
    return Response.json({ 
      error: "خطا در ثبت نمرات"
    }, { status: 500 });
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
    const scoreId = searchParams.get("id");
    const body = await request.json();
    
    if (!scoreId || !mongoose.Types.ObjectId.isValid(scoreId)) {
      return Response.json({ error: "شناسه نمره نامعتبر است" }, { status: 400 });
    }
    
    const score = await MonthlyScore.findById(scoreId);
    if (!score) {
      return Response.json({ error: "نمره یافت نشد" }, { status: 404 });
    }
    
    if (body.scores) {
      score.scores = {
        oral: body.scores.oral !== undefined ? body.scores.oral : score.scores?.oral,
        written: body.scores.written !== undefined ? body.scores.written : score.scores?.written,
        homework: body.scores.homework !== undefined ? body.scores.homework : score.scores?.homework,
        activity: body.scores.activity !== undefined ? body.scores.activity : score.scores?.activity,
        exam: body.scores.exam !== undefined ? body.scores.exam : score.scores?.exam
      };
      // محاسبه میانگین نمرات به صورت دستی (pre-save هم این کار را می‌کند اما برای اطمینان)
      const scoreFields = ['oral', 'written', 'homework', 'activity', 'exam'];
      const validScoreValues = scoreFields
        .map(k => score.scores?.[k])
        .filter(s => s !== null && s !== undefined && s !== '');
      if (validScoreValues.length > 0) {
        const sum = validScoreValues.reduce((acc, val) => acc + Number(val), 0);
        score.average = Number((sum / validScoreValues.length).toFixed(2));
      } else {
        score.average = null;
      }
    }
    if (body.comment !== undefined) score.comment = body.comment;
    score.recordedBy = auth.userId;
    
    await score.save();
    
    return Response.json({
      message: "نمره با موفقیت بروزرسانی شد",
      score
    });
  } catch (error) {
    console.error("Error updating score:", error);
    return Response.json({ error: "خطا در بروزرسانی نمره" }, { status: 500 });
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
    const scoreId = searchParams.get("id");
    
    if (!scoreId || !mongoose.Types.ObjectId.isValid(scoreId)) {
      return Response.json({ error: "شناسه نمره نامعتبر است" }, { status: 400 });
    }
    
    const deletedScore = await MonthlyScore.findByIdAndDelete(scoreId);
    if (!deletedScore) {
      return Response.json({ error: "نمره یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ message: "نمره با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting score:", error);
    return Response.json({ error: "خطا در حذف نمره" }, { status: 500 });
  }
}