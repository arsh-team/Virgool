// app/api/school/student-payments/assign/route.js 

import { connectDB } from "../../../../../lib/db";
import StudentPayment from "../../../../../models/StudentPayment";
import SchoolFee from "../../../../../models/SchoolFee";
import User from "../../../../../models/User";
import Class from "../../../../../models/Class";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";
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
    if (!user || user.type !== 'creator') {
      return { error: "دسترسی غیرمجاز", status: 403 };
    }
    return { userId: decoded.id, user };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

// تابع کمکی برای پیدا کردن کلاس دانش‌آموز
async function findStudentClass(studentId) {
  const classData = await Class.findOne({ students: studentId });
  return classData?._id || null;
}

export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const body = await request.json();
    console.log("Assign fee request body:", body);
    
    const { schoolId, feeId, classId, studentId, academicYear } = body;
    
    if (!schoolId || !feeId) {
      return Response.json({ error: "شناسه مدرسه و تعرفه الزامی است" }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return Response.json({ error: "شناسه مدرسه نامعتبر است" }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(feeId)) {
      return Response.json({ error: "شناسه تعرفه نامعتبر است" }, { status: 400 });
    }
    
    // دریافت تعرفه شهریه
    const schoolFee = await SchoolFee.findById(feeId);
    if (!schoolFee) {
      return Response.json({ error: "تعرفه شهریه یافت نشد" }, { status: 404 });
    }
    
    console.log("School fee found:", schoolFee.name);
    
    // تعیین دانش‌آموزان هدف
    let targetStudents = [];
    
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      // یک دانش‌آموز خاص
      const student = await User.findById(studentId);
      if (student && student.schoolRole === 'student') {
        targetStudents.push(student);
        console.log("Target student found:", student.firstname, student.lastname);
      } else {
        return Response.json({ error: "دانش‌آموز مورد نظر یافت نشد" }, { status: 404 });
      }
    } else if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      // همه دانش‌آموزان یک کلاس
      const classData = await Class.findById(classId);
      if (!classData) {
        return Response.json({ error: "کلاس مورد نظر یافت نشد" }, { status: 404 });
      }
      
      // دریافت دانش‌آموزانی که در این کلاس هستند
      const studentsInClass = await User.find({ 
        schoolRole: 'student',
        'studentInfo.enrolledClass': classId
      });
      
      targetStudents = studentsInClass;
      console.log(`Found ${targetStudents.length} students in class ${classData.name}`);
    } else {
      return Response.json({ error: "لطفاً کلاس یا دانش‌آموز را مشخص کنید" }, { status: 400 });
    }
    
    if (targetStudents.length === 0) {
      return Response.json({ 
        error: "هیچ دانش‌آموزی برای ثبت وضعیت مالی یافت نشد",
        details: "لطفاً مطمئن شوید که دانش‌آموزان در کلاس ثبت شده باشند"
      }, { status: 404 });
    }
    
    let assignedCount = 0;
    let updatedCount = 0;
    let errors = [];
    
    for (const student of targetStudents) {
      try {
        // پیدا کردن کلاس دانش‌آموز
        let studentClassId = classId;
        if (!studentClassId) {
          const foundClass = await findStudentClass(student._id);
          studentClassId = foundClass;
        }
        
        if (!studentClassId) {
          errors.push({
            studentId: student._id,
            name: `${student.firstname} ${student.lastname}`,
            error: "کلاس دانش‌آموز مشخص نیست"
          });
          continue;
        }
        
        // بررسی اینکه آیا قبلاً برای این دانش‌آموز وضعیت مالی ثبت شده است
        let existingPayment = await StudentPayment.findOne({
          student: student._id,
          school: schoolId,
          academicYear: academicYear || "1404-1405"
        });
        
        const paymentItems = schoolFee.feeItems.map(feeItem => {
          if (existingPayment) {
            const existingItem = existingPayment.paymentItems.find(
              item => item.feeItemId === feeItem._id.toString()
            );
            return {
              feeItemId: feeItem._id.toString(),
              feeItemName: feeItem.name,
              totalAmount: feeItem.amount,
              paidAmount: existingItem?.paidAmount || 0,
              remainingAmount: feeItem.amount - (existingItem?.paidAmount || 0),
              isFullyPaid: (existingItem?.paidAmount || 0) >= feeItem.amount
            };
          } else {
            return {
              feeItemId: feeItem._id.toString(),
              feeItemName: feeItem.name,
              totalAmount: feeItem.amount,
              paidAmount: 0,
              remainingAmount: feeItem.amount,
              isFullyPaid: false
            };
          }
        });
        
        if (existingPayment) {
          // به روزرسانی تعرفه موجود
          existingPayment.paymentItems = paymentItems;
          existingPayment.schoolFee = feeId;
          existingPayment.class = studentClassId;
          existingPayment.totalAmount = schoolFee.totalAmount;
          await existingPayment.save();
          updatedCount++;
          console.log(`Updated payment for student: ${student.firstname} ${student.lastname}`);
        } else {
          // ایجاد رکورد جدید
          const newPayment = new StudentPayment({
            student: student._id,
            class: studentClassId,
            school: schoolId,
            schoolFee: feeId,
            academicYear: academicYear || "1404-1405",
            paymentItems: paymentItems,
            totalAmount: schoolFee.totalAmount,
            totalPaid: 0,
            totalRemaining: schoolFee.totalAmount,
            paymentStatus: 'unpaid',
            appliedDiscount: 0,
            discountReason: '',
            notes: '',
            isActive: true
          });
          
          await newPayment.save();
          assignedCount++;
          console.log(`Created new payment for student: ${student.firstname} ${student.lastname}`);
        }
      } catch (err) {
        console.error(`Error processing student ${student._id}:`, err);
        errors.push({
          studentId: student._id,
          name: `${student.firstname} ${student.lastname}`,
          error: err.message
        });
      }
    }
    
    return Response.json({
      success: true,
      message: `${assignedCount} دانش‌آموز جدید ثبت شدند، ${updatedCount} دانش‌آموز به‌روزرسانی شدند`,
      assignedCount,
      updatedCount,
      totalProcessed: assignedCount + updatedCount,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error("Error assigning fee:", error);
    return Response.json({ 
      error: "خطا در ثبت وضعیت مالی دانش‌آموزان"
    }, { status: 500 });
  }
}