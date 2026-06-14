// app/api/school/student-payments/route.js - نسخه اصلاح شده کامل

import { connectDB } from "../../../../lib/db";
import StudentPayment from "../../../../models/StudentPayment";
import SchoolFee from "../../../../models/SchoolFee";
import User from "../../../../models/User";
import Class from "../../../../models/Class";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
import mongoose from "mongoose";

async function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);
    if (!user) {
      return { error: "کاربر یافت نشد", status: 401 };
    }
    return { userId: decoded.id, user };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

// GET /api/school/student-payments?schoolId=...&classId=...&studentId=...
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
    let studentId = searchParams.get("studentId");
    const academicYear = searchParams.get("academicYear") || "1404-1405";
    
    console.log("=== GET Student Payments ===");
    console.log("User role:", auth.user.schoolRole);
    console.log("User ID:", auth.user._id.toString());
    console.log("Requested studentId:", studentId);
    console.log("Academic year:", academicYear);
    
    // اگر کاربر دانش‌آموز است، فقط اطلاعات خودش را بگیر
    if (auth.user.type !== 'creator' && auth.user.schoolRole === 'student') {
      studentId = auth.user._id.toString();
      console.log("Student mode - using own ID:", studentId);
    }
    
    if (!studentId && !schoolId && !classId) {
      return Response.json({ error: "شناسه دانش‌آموز الزامی است" }, { status: 400 });
    }
    
    if (studentId && !mongoose.Types.ObjectId.isValid(studentId)) {
      return Response.json({ error: "شناسه دانش‌آموز نامعتبر است" }, { status: 400 });
    }
    
    // ساخت query
    let query = { 
      ...(studentId ? { student: new mongoose.Types.ObjectId(studentId) } : {}),
      academicYear: academicYear
    };
    if (!studentId) {
      delete query.student;
    }
    
    if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
      query.school = new mongoose.Types.ObjectId(schoolId);
    }
    
    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      query.class = new mongoose.Types.ObjectId(classId);
    }
    
    console.log("Query:", JSON.stringify(query));
    
    // جستجوی وضعیت مالی دانش‌آموز
    let payments = await StudentPayment.find(query)
      .populate("student", "firstname lastname email phone nationalCode")
      .populate("class", "name grade")
      .populate("schoolFee", "name feeItems totalAmount")
      .lean();
    
    console.log(`Found ${payments.length} payment records`);
    
    // اگر رکوردی پیدا نشد، یک رکورد خالی با پیام مناسب برگردان
    if (payments.length === 0) {
      console.log("No payment record found for student");
      if (!studentId) {
        return Response.json({ 
          payments: [],
          message: "No payment records found"
        });
      }
      // اطلاعات دانش‌آموز و کلاس را دریافت کن
      const student = await User.findById(studentId).populate("studentInfo.enrolledClass");
      const studentClass = student?.studentInfo?.enrolledClass;
      
      // برگرداندن یک شیء خالی با اطلاعات پایه
      return Response.json({ 
        payments: [],
        message: "هیچ سابقه مالی برای این دانش‌آموز یافت نشد",
        student: {
          _id: student?._id,
          firstname: student?.firstname,
          lastname: student?.lastname
        },
        class: studentClass ? {
          _id: studentClass._id,
          name: studentClass.name,
          grade: studentClass.grade
        } : null
      });
    }
    
    // اگر کاربر دانش‌آموز است، فقط اطلاعات خودش را برگردان
    if (auth.user.type !== 'creator' && auth.user.schoolRole === 'student') {
      const userPayment = payments.filter(p => p.student?._id.toString() === auth.user._id.toString());
      return Response.json({ payments: userPayment });
    }
    
    return Response.json({ payments });
    
  } catch (error) {
    console.error("Error fetching student payments:", error);
    return Response.json({ error: "خطا در دریافت اطلاعات پرداخت دانش‌آموزان" }, { status: 500 });
  }
}

// POST, PUT, DELETE فقط برای مدیران (بدون تغییر - همانند قبل)
export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    // فقط مدیران می‌توانند ثبت کنند
    if (auth.user.type !== 'creator') {
      return Response.json({ error: "دسترسی غیرمجاز. فقط مدیران می‌توانند ثبت کنند." }, { status: 403 });
    }
    
    const body = await request.json();
    const { schoolId, classId, studentId, schoolFeeId, paymentItems, appliedDiscount, discountReason, notes } = body;
    
    if (!schoolId || !studentId || !classId || !schoolFeeId) {
      return Response.json({ error: "اطلاعات ناقص است" }, { status: 400 });
    }
    
    // بررسی وجود دانش‌آموز
    const student = await User.findById(studentId);
    if (!student || student.schoolRole !== 'student') {
      return Response.json({ error: "دانش‌آموز یافت نشد" }, { status: 404 });
    }
    
    // بررسی وجود کلاس
    const classData = await Class.findById(classId);
    if (!classData) {
      return Response.json({ error: "کلاس یافت نشد" }, { status: 404 });
    }
    
    // Check if payment record already exists
    let studentPayment = await StudentPayment.findOne({
      student: studentId,
      school: schoolId,
      academicYear: "1404-1405"
    });
    
    const schoolFee = await SchoolFee.findById(schoolFeeId);
    if (!schoolFee) {
      return Response.json({ error: "تعرفه شهریه یافت نشد" }, { status: 404 });
    }
    
    // Prepare payment items from school fee
    const preparedPaymentItems = schoolFee.feeItems.map(feeItem => {
      const customItem = paymentItems?.find(p => p.feeItemId === feeItem._id.toString());
      return {
        feeItemId: feeItem._id.toString(),
        feeItemName: feeItem.name,
        totalAmount: customItem?.totalAmount !== undefined ? customItem.totalAmount : feeItem.amount,
        paidAmount: customItem?.paidAmount || 0,
        remainingAmount: (customItem?.totalAmount !== undefined ? customItem.totalAmount : feeItem.amount) - (customItem?.paidAmount || 0),
        isFullyPaid: (customItem?.paidAmount || 0) >= (customItem?.totalAmount !== undefined ? customItem.totalAmount : feeItem.amount)
      };
    });
    
    if (studentPayment) {
      // Update existing
      studentPayment.paymentItems = preparedPaymentItems;
      studentPayment.schoolFee = schoolFeeId;
      studentPayment.class = classId;
      if (appliedDiscount !== undefined) studentPayment.appliedDiscount = appliedDiscount;
      if (discountReason !== undefined) studentPayment.discountReason = discountReason;
      if (notes !== undefined) studentPayment.notes = notes;
      await studentPayment.save();
    } else {
      // Create new
      studentPayment = new StudentPayment({
        student: studentId,
        class: classId,
        school: schoolId,
        schoolFee: schoolFeeId,
        academicYear: "1404-1405",
        paymentItems: preparedPaymentItems,
        appliedDiscount: appliedDiscount || 0,
        discountReason: discountReason || '',
        notes: notes || ''
      });
      await studentPayment.save();
    }
    
    return Response.json({ 
      message: "وضعیت مالی دانش‌آموز با موفقیت ثبت شد", 
      payment: studentPayment 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating student payment:", error);
    return Response.json({ error: "خطا در ثبت وضعیت مالی دانش‌آموز" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    if (auth.user.type !== 'creator') {
      return Response.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");
    const body = await request.json();
    
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return Response.json({ error: "شناسه پرداخت نامعتبر است" }, { status: 400 });
    }
    
    const payment = await StudentPayment.findById(paymentId);
    if (!payment) {
      return Response.json({ error: "پرداخت یافت نشد" }, { status: 404 });
    }
    
    if (body.paymentItems) payment.paymentItems = body.paymentItems;
    if (body.appliedDiscount !== undefined) payment.appliedDiscount = body.appliedDiscount;
    if (body.discountReason !== undefined) payment.discountReason = body.discountReason;
    if (body.notes !== undefined) payment.notes = body.notes;
    
    await payment.save();
    
    return Response.json({ 
      message: "وضعیت مالی با موفقیت به‌روزرسانی شد", 
      payment 
    });
  } catch (error) {
    console.error("Error updating student payment:", error);
    return Response.json({ error: "خطا در به‌روزرسانی وضعیت مالی" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    if (auth.user.type !== 'creator') {
      return Response.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("id");
    
    if (!paymentId || !mongoose.Types.ObjectId.isValid(paymentId)) {
      return Response.json({ error: "شناسه پرداخت نامعتبر است" }, { status: 400 });
    }
    
    const payment = await StudentPayment.findByIdAndDelete(paymentId);
    if (!payment) {
      return Response.json({ error: "پرداخت یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ message: "وضعیت مالی با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting student payment:", error);
    return Response.json({ error: "خطا در حذف وضعیت مالی" }, { status: 500 });
  }
}
