// app/api/school/discipline/route.js
import { connectDB } from "../../../../lib/db";
import Discipline from "../../../../models/Discipline";
import Notification from "../../../../models/Notification";
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

async function createNotification(userId, title, message, type, actionUrl) {
  try {
    const notification = new Notification({
      user: userId,
      title,
      message,
      type,
      actionUrl
    });
    await notification.save();
  } catch (error) {
    console.error("Error creating notification:", error);
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
    let studentId = searchParams.get("studentId");
    
    // Students can only see their own discipline records
    if (!isStaff) {
      studentId = auth.userId;
    }
    const classId = searchParams.get("classId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    
    let query = {};
    if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) query.school = schoolId;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) query.student = studentId;
    if (classId && mongoose.Types.ObjectId.isValid(classId)) query.class = classId;
    if (startDate) query.date = { $gte: new Date(startDate) };
    if (endDate) query.date = { ...query.date, $lte: new Date(endDate) };
    
    const disciplines = await Discipline.find(query)
      .populate("student", "firstname lastname email phone")
      .populate("recordedBy", "firstname lastname")
      .populate("resolvedBy", "firstname lastname")
      .sort({ date: -1 })
      .lean();
    
    return Response.json({ disciplines });
  } catch (error) {
    console.error("Error fetching disciplines:", error);
    return Response.json({ error: "خطا در دریافت موارد انضباطی" }, { status: 500 });
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
    const { studentId, schoolId, classId, type, title, description, severity, points } = body;
    
    if (!studentId || !schoolId || !type || !title || !description) {
      return Response.json({ error: "Ø§Ø·Ù„Ø§Ø¹Ø§Øª Ù…ÙˆØ±Ø¯ Ø§Ù†Ø¶Ø¨Ø§Ø·ÛŒ Ù†Ø§Ù‚Øµ Ø§Ø³Øª" }, { status: 400 });
    }
    
    let finalClassId = classId;
    if (!finalClassId) {
      const student = await User.findById(studentId).select("studentInfo.enrolledClass");
      finalClassId = student?.studentInfo?.enrolledClass;
    }
    
    if (!finalClassId || !mongoose.Types.ObjectId.isValid(finalClassId)) {
      return Response.json({ error: "Ú©Ù„Ø§Ø³ Ø¯Ø§Ù†Ø´â€ŒØ¢Ù…ÙˆØ² Ù…Ø´Ø®Øµ Ù†ÛŒØ³Øª" }, { status: 400 });
    }
    
    const discipline = new Discipline({
      student: studentId,
      school: schoolId,
      class: finalClassId,
      recordedBy: auth.userId,
      type,
      title,
      description,
      severity,
      points: points || 0
    });
    
    await discipline.save();
    
    // Send notification to student
    await createNotification(
      studentId,
      `ثبت مورد انضباطی: ${title}`,
      `${description}\nنوع: ${type === 'warning' ? 'اخطار' : type === 'probation' ? 'تذکر کتبی' : type === 'suspension' ? 'تعلیق' : type === 'expulsion' ? 'اخراج' : 'تشویق'}`,
      type === 'commendation' ? 'success' : 'warning',
      `/school-management/student/${studentId}`
    );
    
    return Response.json({
      message: "مورد انضباطی با موفقیت ثبت شد",
      discipline
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating discipline:", error);
    return Response.json({ error: "خطا در ثبت مورد انضباطی" }, { status: 500 });
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
    const disciplineId = searchParams.get("id");
    const body = await request.json();
    
    const discipline = await Discipline.findById(disciplineId);
    if (!discipline) {
      return Response.json({ error: "مورد انضباطی یافت نشد" }, { status: 404 });
    }
    
    if (body.isResolved) {
      discipline.isResolved = true;
      discipline.resolvedAt = new Date();
      discipline.resolvedBy = auth.userId;
      discipline.resolutionNote = body.resolutionNote;
      
      await createNotification(
        discipline.student,
        "رفع مورد انضباطی",
        `مورد انضباطی "${discipline.title}" با موفقیت رفع شد${body.resolutionNote ? `: ${body.resolutionNote}` : ''}`,
        "info",
        `/school-management/student/${discipline.student}`
      );
    }
    
    if (body.type) discipline.type = body.type;
    if (body.title) discipline.title = body.title;
    if (body.description) discipline.description = body.description;
    if (body.severity) discipline.severity = body.severity;
    
    await discipline.save();
    
    return Response.json({
      message: "مورد انضباطی با موفقیت بروزرسانی شد",
      discipline
    });
  } catch (error) {
    console.error("Error updating discipline:", error);
    return Response.json({ error: "خطا در بروزرسانی مورد انضباطی" }, { status: 500 });
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
    const disciplineId = searchParams.get("id");
    
    // SECURITY FIX: First find the record, then check authorization BEFORE deleting
    const discipline = await Discipline.findById(disciplineId);
    if (!discipline) {
      return Response.json({ error: "مورد انضباطی یافت نشد" }, { status: 404 });
    }

    // Check that the discipline belongs to the user's school
    const isCreatorOfSchool = requestingUser.type === 'creator';
    const isTeacherInSchool = requestingUser.schoolRole === 'teacher' && discipline.school.toString() === requestingUser.school?.toString();
    if (!isCreatorOfSchool && !isTeacherInSchool) {
      return Response.json({ error: "شما فقط می‌توانید موارد انضباطی مدرسه خود را حذف کنید" }, { status: 403 });
    }

    // Only proceed with deletion after authorization check
    await Discipline.findByIdAndDelete(disciplineId);

    return Response.json({ message: "مورد انضباطی با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting discipline:", error);
    return Response.json({ error: "خطا در حذف مورد انضباطی" }, { status: 500 });
  }
}
