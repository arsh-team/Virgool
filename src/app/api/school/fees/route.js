// app/api/school/fees/route.js - نسخه اصلاح شده

import { connectDB } from "../../../../lib/db";
import SchoolFee from "../../../../models/SchoolFee";
import PaymentExtraItem from "../../../../models/PaymentExtraItem";
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
    if (!user || user.type !== 'creator') {
      return { error: "دسترسی غیرمجاز", status: 403 };
    }
    return { userId: decoded.id, user };
  } catch (error) {
    console.error("Auth error:", error);
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

// GET /api/school/fees?schoolId=...&academicYear=...
export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const academicYear = searchParams.get("academicYear") || "1404-1405";
    
    if (!schoolId) {
      return Response.json({ error: "شناسه مدرسه الزامی است" }, { status: 400 });
    }
    
    // بررسی وجود schoolId معتبر
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return Response.json({ error: "شناسه مدرسه نامعتبر است" }, { status: 400 });
    }
    
    // حذف شرط isActive برای نمایش همه تعرفه‌ها
    const fees = await SchoolFee.find({ 
      school: new mongoose.Types.ObjectId(schoolId), 
      academicYear: academicYear
    }).sort({ createdAt: -1 }).lean();
    
    const extraItems = await PaymentExtraItem.find({ 
      school: new mongoose.Types.ObjectId(schoolId)
    }).sort({ createdAt: -1 }).lean();
    
    console.log(`Found ${fees.length} fees and ${extraItems.length} extra items for school ${schoolId}`);
    
    return Response.json({ 
      success: true,
      fees: fees || [], 
      extraItems: extraItems || [] 
    });
  } catch (error) {
    console.error("Error fetching fees:", error);
    return Response.json({ 
      error: "خطا در دریافت اطلاعات شهریه"
    }, { status: 500 });
  }
}

// POST /api/school/fees
export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const body = await request.json();
    console.log("Received fee data:", body);
    
    const { schoolId, name, academicYear, feeItems, applyToAllClasses, classIds, paymentTerms, numberOfInstallments } = body;
    
    if (!schoolId || !name || !feeItems || feeItems.length === 0) {
      return Response.json({ error: "اطلاعات شهریه ناقص است" }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return Response.json({ error: "شناسه مدرسه نامعتبر است" }, { status: 400 });
    }
    
    // Validate class IDs if not applying to all classes
    let validClassIds = [];
    if (!applyToAllClasses && classIds && classIds.length > 0) {
      for (const classId of classIds) {
        if (mongoose.Types.ObjectId.isValid(classId)) {
          validClassIds.push(new mongoose.Types.ObjectId(classId));
        }
      }
    }
    
    const schoolFee = new SchoolFee({
      school: new mongoose.Types.ObjectId(schoolId),
      name: name.trim(),
      academicYear: academicYear || "1404-1405",
      feeItems: feeItems.map(item => ({
        name: item.name.trim(),
        amount: Number(item.amount),
        isRequired: item.isRequired !== false,
        description: item.description || ''
      })),
      applyToAllClasses: applyToAllClasses !== false,
      classIds: validClassIds,
      paymentTerms: paymentTerms || 'monthly',
      numberOfInstallments: numberOfInstallments || 9,
      createdBy: new mongoose.Types.ObjectId(auth.userId),
      isActive: true
    });
    
    await schoolFee.save();
    
    console.log("Fee created successfully:", schoolFee._id);
    
    return Response.json({ 
      success: true,
      message: "تعرفه شهریه با موفقیت ثبت شد", 
      fee: schoolFee 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating fee:", error);
    return Response.json({ 
      error: "خطا در ثبت تعرفه شهریه"
    }, { status: 500 });
  }
}

// PUT /api/school/fees?id=...
export async function PUT(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const feeId = searchParams.get("id");
    const body = await request.json();
    
    if (!feeId || !mongoose.Types.ObjectId.isValid(feeId)) {
      return Response.json({ error: "شناسه تعرفه نامعتبر است" }, { status: 400 });
    }
    
    const fee = await SchoolFee.findById(feeId);
    if (!fee) {
      return Response.json({ error: "تعرفه یافت نشد" }, { status: 404 });
    }
    
    if (body.name) fee.name = body.name.trim();
    if (body.feeItems) {
      fee.feeItems = body.feeItems.map(item => ({
        name: item.name.trim(),
        amount: Number(item.amount),
        isRequired: item.isRequired !== false,
        description: item.description || ''
      }));
    }
    if (body.applyToAllClasses !== undefined) fee.applyToAllClasses = body.applyToAllClasses;
    if (body.classIds) {
      fee.classIds = body.classIds.map(id => new mongoose.Types.ObjectId(id));
    }
    if (body.paymentTerms) fee.paymentTerms = body.paymentTerms;
    if (body.numberOfInstallments) fee.numberOfInstallments = body.numberOfInstallments;
    if (body.isActive !== undefined) fee.isActive = body.isActive;
    
    await fee.save();
    
    return Response.json({ 
      success: true,
      message: "تعرفه با موفقیت به‌روزرسانی شد", 
      fee 
    });
  } catch (error) {
    console.error("Error updating fee:", error);
    return Response.json({ error: "خطا در به‌روزرسانی تعرفه" }, { status: 500 });
  }
}

// DELETE /api/school/fees?id=...
export async function DELETE(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const feeId = searchParams.get("id");
    
    if (!feeId || !mongoose.Types.ObjectId.isValid(feeId)) {
      return Response.json({ error: "شناسه تعرفه نامعتبر است" }, { status: 400 });
    }
    
    const fee = await SchoolFee.findByIdAndDelete(feeId);
    if (!fee) {
      return Response.json({ error: "تعرفه یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ 
      success: true,
      message: "تعرفه با موفقیت حذف شد" 
    });
  } catch (error) {
    console.error("Error deleting fee:", error);
    return Response.json({ error: "خطا در حذف تعرفه" }, { status: 500 });
  }
}