// app/api/school/classes/route.js
import { connectDB } from "../../../../lib/db";
import Class from "../../../../models/Class";
import Service from "../../../../models/Service";
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
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const grade = searchParams.get("grade");
    const isActive = searchParams.get("isActive");
    
    if (!schoolId) {
      return Response.json({ error: "شناسه مدرسه الزامی است" }, { status: 400 });
    }
    
    // Verify the requesting user belongs to the specified school
    const isCreator = requestingUser.type === 'creator';
    const belongsToSchool = requestingUser.school?.toString() === schoolId;
    if (!isCreator && !belongsToSchool) {
      return Response.json({ error: "شما دسترسی به اطلاعات این مدرسه را ندارید" }, { status: 403 });
    }
    
    let query = { school: schoolId };
    if (grade) query.grade = grade;
    if (isActive !== null && isActive !== "") query.isActive = isActive === "true";
    
    const classes = await Class.find(query)
      .populate("teacher", "firstname lastname email phone")
      .populate("assistantTeacher", "firstname lastname email phone")
      .populate("students", "firstname lastname email phone")
      .lean();
    
    return Response.json({ classes });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return Response.json({ error: "خطا در دریافت کلاس‌ها" }, { status: 500 });
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
    console.log("📦 Received body in POST /api/school/classes:", body);
    
    const { schoolId, name, grade, teacher, teacherId, assistantTeacher, capacity, classroom, isActive } = body;
    const finalTeacherId = teacher || teacherId;
    
    if (!schoolId) {
      return Response.json({ error: "شناسه مدرسه الزامی است" }, { status: 400 });
    }
    
    if (!name || !grade) {
      return Response.json({ error: "نام کلاس و پایه الزامی است" }, { status: 400 });
    }
    
    // Check subscription limit for classes
    const { checkSubscriptionLimit } = await import("../../../../lib/subscription-check");
    const limitCheck = await checkSubscriptionLimit(auth.userId, 'classes', schoolId);
    
    if (!limitCheck.success) {
      return Response.json({ 
        error: limitCheck.error,
        currentCount: limitCheck.currentCount,
        maxCount: limitCheck.maxCount,
        limitReached: limitCheck.limitReached
      }, { status: limitCheck.status || 400 });
    }
    
    // Check if school exists
    const service = await Service.findById(schoolId);
    if (!service) {
      return Response.json({ error: "مدرسه یافت نشد" }, { status: 404 });
    }
    
    // Prepare data with proper ObjectId handling
    const classData = {
      name: name,
      grade: grade,
      school: schoolId,
      capacity: capacity || 30,
      classroom: classroom || "",
      isActive: isActive !== undefined ? isActive : true
    };
    
    // Handle teacher field - only add if it's a valid ObjectId
    if (finalTeacherId && mongoose.Types.ObjectId.isValid(finalTeacherId)) {
      classData.teacher = finalTeacherId;
    }
    
    // Handle assistantTeacher field - only add if it's a valid ObjectId AND not empty string
    if (assistantTeacher && assistantTeacher !== "" && mongoose.Types.ObjectId.isValid(assistantTeacher)) {
      classData.assistantTeacher = assistantTeacher;
    }
    
    console.log("📝 Creating class with data:", classData);
    
    const newClass = new Class(classData);
    await newClass.save();
    
    return Response.json({
      message: "کلاس با موفقیت ایجاد شد",
      class: newClass
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating class:", error);
    return Response.json({ 
      error: "خطا در ایجاد کلاس"
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
    const classId = searchParams.get("id");
    const body = await request.json();
    
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return Response.json({ error: "کلاس یافت نشد" }, { status: 404 });
    }
    
    // Verify the class belongs to the requesting user's school
    const isCreator = requestingUser.type === 'creator';
    const belongsToSchool = requestingUser.school?.toString() === existingClass.school?.toString();
    if (!isCreator && !belongsToSchool) {
      return Response.json({ error: "شما دسترسی به ویرایش کلاس این مدرسه را ندارید" }, { status: 403 });
    }
    
    // Prepare update data with proper ObjectId handling
    const updateData = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.grade !== undefined) updateData.grade = body.grade;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.classroom !== undefined) updateData.classroom = body.classroom;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    
    // Handle teacher field
    const finalTeacherId = body.teacher !== undefined ? body.teacher : body.teacherId;
    if (body.teacher !== undefined || body.teacherId !== undefined) {
      if (finalTeacherId && finalTeacherId !== "" && mongoose.Types.ObjectId.isValid(finalTeacherId)) {
        updateData.teacher = finalTeacherId;
      } else {
        updateData.teacher = null;
      }
    }
    
    // Handle assistantTeacher field
    if (body.assistantTeacher !== undefined) {
      if (body.assistantTeacher && body.assistantTeacher !== "" && mongoose.Types.ObjectId.isValid(body.assistantTeacher)) {
        updateData.assistantTeacher = body.assistantTeacher;
      } else {
        updateData.assistantTeacher = null;
      }
    }
    
    const updatedClass = await Class.findByIdAndUpdate(classId, updateData, { new: true });
    
    return Response.json({
      message: "کلاس با موفقیت بروزرسانی شد",
      class: updatedClass
    });
  } catch (error) {
    console.error("Error updating class:", error);
    return Response.json({ error: "خطا در بروزرسانی کلاس" }, { status: 500 });
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
    const classId = searchParams.get("id");
    
    const existingClass = await Class.findById(classId);
    if (!existingClass) {
      return Response.json({ error: "کلاس یافت نشد" }, { status: 404 });
    }
    
    // Verify the class belongs to the requesting user's school
    const isCreator = requestingUser.type === 'creator';
    const belongsToSchool = requestingUser.school?.toString() === existingClass.school?.toString();
    if (!isCreator && !belongsToSchool) {
      return Response.json({ error: "شما دسترسی به حذف کلاس این مدرسه را ندارید" }, { status: 403 });
    }
    
    await Class.findByIdAndDelete(classId);
    
    return Response.json({ message: "کلاس با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting class:", error);
    return Response.json({ error: "خطا در حذف کلاس" }, { status: 500 });
  }
}
