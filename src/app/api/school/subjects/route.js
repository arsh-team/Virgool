// app/api/school/subjects/route.js

import { connectDB } from "../../../../lib/db";
import Subject from "../../../../models/Subject";
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
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const classId = searchParams.get("classId");
    const teacherId = searchParams.get("teacherId");
    
    console.log("🔍 GET subjects with params:", { schoolId, classId, teacherId });
    
    let query = {};
    
    if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
      query.school = schoolId;
    }
    
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      query.classes = { $in: [new mongoose.Types.ObjectId(classId)] };
    }
    
    if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) {
      query.teacher = teacherId;
    }
    
    console.log("📝 Final query:", JSON.stringify(query));
    
    const subjects = await Subject.find(query)
      .populate({
        path: "teacher",
        select: "firstname lastname email phone teacherInfo profile",
        populate: {
          path: "teacherInfo",
          select: "degree fieldOfStudy university yearsOfExperience socials expertise"
        }
      })
      .populate("classes", "name grade")
      .lean();
    
    console.log(`✅ Found ${subjects.length} subjects`);
    
    return Response.json({ subjects });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return Response.json({ error: "خطا در دریافت دروس" }, { status: 500 });
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
    if (!requestingUser || requestingUser.type !== 'creator') {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    const body = await request.json();
    console.log("📦 Received body in POST /api/school/subjects:", body);
    
    // پشتیبانی از هر دو نام فیلد: teacher و teacherId
    const { schoolId, name, teacher, teacherId, classes, classIds, hoursPerWeek, description, isActive } = body;
    
    // تعیین شناسه دبیر - از teacher یا teacherId استفاده کن
    const finalTeacherId = teacher || teacherId;
    
    if (!schoolId) {
      return Response.json({ error: "شناسه مدرسه الزامی است" }, { status: 400 });
    }
    
    if (!name) {
      return Response.json({ error: "نام درس الزامی است" }, { status: 400 });
    }
    
    if (!finalTeacherId || !mongoose.Types.ObjectId.isValid(finalTeacherId)) {
      console.log("Invalid teacher ID:", finalTeacherId);
      return Response.json({ error: "دبیر معتبر الزامی است" }, { status: 400 });
    }
    
    // Check if school exists
    const service = await Service.findById(schoolId);
    if (!service) {
      return Response.json({ error: "مدرسه یافت نشد" }, { status: 404 });
    }
    
    // Check if teacher exists
    const teacherUser = await User.findById(finalTeacherId);
    if (!teacherUser) {
      return Response.json({ error: "دبیر یافت نشد" }, { status: 404 });
    }
    
    // Prepare classes array - پشتیبانی از هر دو نام: classes و classIds
    let classesArray = [];
    const classIdsSource = classes || classIds;
    if (classIdsSource && Array.isArray(classIdsSource)) {
      classesArray = classIdsSource.filter(c => c && c !== "" && mongoose.Types.ObjectId.isValid(c));
    }
    
    // تولید کد خودکار اگر ارسال نشده باشد
    let subjectCode = body.code;
    if (!subjectCode) {
      const count = await Subject.countDocuments({ school: schoolId });
      subjectCode = `SUB-${(count + 1).toString().padStart(4, '0')}`;
    }
    
    const subjectData = {
      name: name.trim(),
      code: subjectCode,
      school: schoolId,
      teacher: finalTeacherId,
      classes: classesArray,
      hoursPerWeek: hoursPerWeek || 2,
      description: description || "",
      isActive: isActive !== undefined ? isActive : true
    };
    
    console.log("📝 Creating subject with data:", subjectData);
    
    const newSubject = new Subject(subjectData);
    await newSubject.save();
    
    // Populate the saved subject before returning
    const populatedSubject = await Subject.findById(newSubject._id)
      .populate({
        path: "teacher",
        select: "firstname lastname email phone teacherInfo profile",
        populate: {
          path: "teacherInfo",
          select: "degree fieldOfStudy university yearsOfExperience socials expertise"
        }
      })
      .populate("classes", "name grade");
    
    return Response.json({
      message: "درس با موفقیت ایجاد شد",
      subject: populatedSubject
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating subject:", error);
    if (error.code === 11000) {
      return Response.json({ 
        error: "درسی با این مشخصات قبلاً ثبت شده است"
      }, { status: 400 });
    }
    return Response.json({ 
      error: "خطا در ایجاد درس"
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
    if (!requestingUser || requestingUser.type !== 'creator') {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("id");
    
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return Response.json({ error: "شناسه درس نامعتبر است" }, { status: 400 });
    }
    
    const body = await request.json();
    const { name, teacher, teacherId, classes, classIds, hoursPerWeek, description, isActive } = body;
    
    // پشتیبانی از هر دو نام فیلد
    const finalTeacherId = teacher || teacherId;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (finalTeacherId && mongoose.Types.ObjectId.isValid(finalTeacherId)) updateData.teacher = finalTeacherId;
    
    // پشتیبانی از هر دو نام: classes و classIds
    const classIdsSource = classes || classIds;
    if (classIdsSource && Array.isArray(classIdsSource)) {
      updateData.classes = classIdsSource.filter(c => c && c !== "" && mongoose.Types.ObjectId.isValid(c));
    }
    
    if (hoursPerWeek !== undefined) updateData.hoursPerWeek = hoursPerWeek;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedSubject = await Subject.findByIdAndUpdate(
      subjectId,
      updateData,
      { new: true, runValidators: true }
    )
    .populate({
      path: "teacher",
      select: "firstname lastname email phone teacherInfo profile",
      populate: {
        path: "teacherInfo",
        select: "degree fieldOfStudy university yearsOfExperience socials expertise"
      }
    })
    .populate("classes", "name grade");
    
    if (!updatedSubject) {
      return Response.json({ error: "درس یافت نشد" }, { status: 404 });
    }
    
    return Response.json({
      message: "درس با موفقیت بروزرسانی شد",
      subject: updatedSubject
    });
    
  } catch (error) {
    console.error("Error updating subject:", error);
    if (error.code === 11000) {
      return Response.json({ 
        error: "درسی با این مشخصات قبلاً ثبت شده است"
      }, { status: 400 });
    }
    return Response.json({ 
      error: "خطا در بروزرسانی درس"
    }, { status: 500 });
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
    if (!requestingUser || requestingUser.type !== 'creator') {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("id");
    
    if (!subjectId || !mongoose.Types.ObjectId.isValid(subjectId)) {
      return Response.json({ error: "شناسه درس نامعتبر است" }, { status: 400 });
    }
    
    const deletedSubject = await Subject.findByIdAndDelete(subjectId);
    
    if (!deletedSubject) {
      return Response.json({ error: "درس یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ message: "درس با موفقیت حذف شد" });
    
  } catch (error) {
    console.error("Error deleting subject:", error);
    return Response.json({ 
      error: "خطا در حذف درس"
    }, { status: 500 });
  }
}