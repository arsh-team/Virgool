// app/api/school/payment-extra-items/route.js
import { connectDB } from "../../../../lib/db";
import PaymentExtraItem from "../../../../models/PaymentExtraItem";
import User from "../../../../models/User";
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
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

// GET /api/school/payment-extra-items?schoolId=...
export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    
    if (!schoolId) {
      return Response.json({ error: "شناسه مدرسه الزامی است" }, { status: 400 });
    }
    
    const extraItems = await PaymentExtraItem.find({ school: schoolId }).sort({ createdAt: -1 });
    
    return Response.json({ extraItems }, {
      headers: {
        'Cache-Control': 'private, max-age=60',
        'CDN-Cache-Control': 'max-age=60',
      }
    });
  } catch (error) {
    console.error("Error fetching extra items:", error);
    return Response.json({ error: "خطا در دریافت آیتم‌های اضافی" }, { status: 500 });
  }
}

// POST /api/school/payment-extra-items
export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const body = await request.json();
    const { schoolId, name, description, type, defaultAmount, applicableClasses, applicableToAllClasses } = body;
    
    if (!schoolId || !name) {
      return Response.json({ error: "نام آیتم الزامی است" }, { status: 400 });
    }
    
    const extraItem = new PaymentExtraItem({
      school: schoolId,
      name,
      description: description || '',
      type: type || 'extra',
      defaultAmount: defaultAmount || 0,
      applicableClasses: applicableClasses || [],
      applicableToAllClasses: applicableToAllClasses !== false,
      createdBy: auth.userId
    });
    
    await extraItem.save();
    
    return Response.json({ 
      message: "آیتم اضافی با موفقیت ثبت شد", 
      extraItem 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating extra item:", error);
    return Response.json({ error: "خطا در ثبت آیتم اضافی" }, { status: 500 });
  }
}

// DELETE /api/school/payment-extra-items?id=...
export async function DELETE(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("id");
    
    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return Response.json({ error: "شناسه آیتم نامعتبر است" }, { status: 400 });
    }
    
    const item = await PaymentExtraItem.findByIdAndDelete(itemId);
    if (!item) {
      return Response.json({ error: "آیتم یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ message: "آیتم با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting extra item:", error);
    return Response.json({ error: "خطا در حذف آیتم" }, { status: 500 });
  }
}