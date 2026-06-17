// app/api/school/classes/[id]/route.js
import { connectDB } from "../../../../../lib/db";
import Class from "../../../../../models/Class";
import User from "../../../../../models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const SECRET = process.env.JWT_SECRET;

async function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, SECRET);
    return { userId: decoded.id };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

// تابع هوشمند برای استخراج ObjectId از هر نوع داده
function extractObjectId(value) {
  if (!value) return null;
  
  // اگر از قبل ObjectId است
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }
  
  // اگر رشته است
  if (typeof value === 'string') {
    const cleanValue = value.trim();
    
    // اگر دقیقاً برابر [object Object] است
    if (cleanValue === '[object Object]') {
      console.log("⚠️ Received [object Object] in class ID endpoint");
      return null;
    }
    
    // اگر فرمت ObjectId معتبر دارد (24 کاراکتر هگزادسیمال)
    if (/^[a-fA-F0-9]{24}$/.test(cleanValue)) {
      return new mongoose.Types.ObjectId(cleanValue);
    }
    
    return null;
  }
  
  // اگر شیء است
  if (typeof value === 'object') {
    // استخراج از _id
    if (value._id) {
      return extractObjectId(value._id);
    }
    // استخراج از id
    if (value.id) {
      return extractObjectId(value.id);
    }
    // اگر خود شیء مستقیماً ObjectId است
    if (value.toString && mongoose.Types.ObjectId.isValid(value.toString())) {
      return new mongoose.Types.ObjectId(value.toString());
    }
  }
  
  return null;
}

// تابع برای پیدا کردن کلاس از طریق کاربر
async function findClassFromUser(userId) {
  try {
    const user = await User.findById(userId)
      .populate('studentInfo.enrolledClass')
      .lean();
    
    if (user?.studentInfo?.enrolledClass) {
      const classObj = user.studentInfo.enrolledClass;
      // اگر کلاس به صورت کامل populate شده، _id دارد
      if (classObj._id) {
        return classObj._id;
      }
      // اگر فقط id است
      if (classObj.id) {
        return classObj.id;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Error finding class from user:", error);
    return null;
  }
}

export async function GET(request, { params }) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    // ابتدا سعی می‌کنیم params رو دریافت کنیم
    let resolvedParams = await params;
    let classId = resolvedParams.id;
    
    console.log("📌 Received classId param:", classId, "Type:", typeof classId);
    
    let validClassId = null;
    
    // روش 1: استخراج مستقیم از پارامتر
    validClassId = extractObjectId(classId);
    
    // روش 2: اگر نتونستیم استخراج کنیم، از طریق کاربر پیدا می‌کنیم
    if (!validClassId) {
      console.log("⚠️ Could not extract classId from params, trying to find from user...");
      validClassId = await findClassFromUser(auth.userId);
      
      if (validClassId) {
        console.log("✅ Found class from user profile:", validClassId);
      }
    }
    
    // روش 3: اگر باز هم نتونستیم، از کل پارامترهای URL استفاده می‌کنیم
    if (!validClassId) {
      const url = new URL(request.url);
      const pathParts = url.pathname.split('/');
      // آدرس به صورت /api/school/classes/[id] است
      // بنابراین id در ایندکس 4 قرار دارد
      const possibleId = pathParts[4];
      if (possibleId && /^[a-fA-F0-9]{24}$/.test(possibleId)) {
        validClassId = new mongoose.Types.ObjectId(possibleId);
        console.log("✅ Extracted classId from URL path:", validClassId);
      }
    }
    
    // اگر هیچ راهی جواب نداد، خطای 400 برمی‌گردونیم
    if (!validClassId) {
      console.error("❌ Could not find valid classId from any source");
      return Response.json({ 
        error: "شناسه کلاس نامعتبر است"
      }, { status: 400 });
    }
    
    console.log("✅ Fetching class with ID:", validClassId.toString());
    
    const classData = await Class.findById(validClassId)
      .populate("teacher", "firstname lastname email phone teacherInfo")
      .populate("students", "firstname lastname email phone studentInfo profile");
    
    if (!classData) {
      return Response.json({ error: "کلاس یافت نشد" }, { status: 404 });
    }
    
    // Verify the user belongs to the school that owns this class
    const requestingUser = await User.findById(auth.userId);
    if (requestingUser) {
      const isCreator = requestingUser.type === 'creator';
      const belongsToSchool = requestingUser.school?.toString() === classData.school?.toString();
      if (!isCreator && !belongsToSchool) {
        return Response.json({ error: "شما دسترسی به اطلاعات این کلاس را ندارید" }, { status: 403 });
      }
    }
    
    console.log("✅ Class found:", classData.name);
    
    return Response.json({ class: classData });
    
  } catch (error) {
    console.error("❌ Error fetching class:", error);
    return Response.json({ 
      error: "خطا در دریافت کلاس: " + error.message 
    }, { status: 500 });
  }
}

// همچنین برای PUT، DELETE و سایر متدها هم می‌توانید همین منطق را اعمال کنید
export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const resolvedParams = await params;
    let classId = resolvedParams.id;
    
    let validClassId = extractObjectId(classId);
    
    if (!validClassId) {
      validClassId = await findClassFromUser(auth.userId);
    }
    
    if (!validClassId) {
      return Response.json({ error: "شناسه کلاس نامعتبر است" }, { status: 400 });
    }
    
    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser || (requestingUser.type !== 'creator' && requestingUser.schoolRole !== 'teacher')) {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    // Verify the class belongs to the user's school before updating
    const classToUpdate = await Class.findById(validClassId);
    if (!classToUpdate) {
      return Response.json({ error: "کلاس یافت نشد" }, { status: 404 });
    }
    const isCreator = requestingUser.type === 'creator';
    const belongsToSchool = requestingUser.school?.toString() === classToUpdate.school?.toString();
    if (!isCreator && !belongsToSchool) {
      return Response.json({ error: "شما دسترسی به ویرایش کلاس این مدرسه را ندارید" }, { status: 403 });
    }
    
    const body = await request.json();
    const { name, grade, capacity, description, teacher } = body;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (grade !== undefined) updateData.grade = grade;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (description !== undefined) updateData.description = description;
    if (teacher !== undefined) updateData.teacher = teacher;
    const updatedClass = await Class.findByIdAndUpdate(
      validClassId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedClass) {
      return Response.json({ error: "کلاس یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ class: updatedClass });
    
  } catch (error) {
    console.error("Error updating class:", error);
    return Response.json({ error: "خطا در بروزرسانی کلاس" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const resolvedParams = await params;
    let classId = resolvedParams.id;
    
    let validClassId = extractObjectId(classId);
    
    if (!validClassId) {
      validClassId = await findClassFromUser(auth.userId);
    }
    
    if (!validClassId) {
      return Response.json({ error: "شناسه کلاس نامعتبر است" }, { status: 400 });
    }
    
    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser || (requestingUser.type !== 'creator' && requestingUser.schoolRole !== 'teacher')) {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }
    
    // Verify the class belongs to the user's school before deleting
    const classToDelete = await Class.findById(validClassId);
    if (!classToDelete) {
      return Response.json({ error: "کلاس یافت نشد" }, { status: 404 });
    }
    const isCreator = requestingUser.type === 'creator';
    const belongsToSchool = requestingUser.school?.toString() === classToDelete.school?.toString();
    if (!isCreator && !belongsToSchool) {
      return Response.json({ error: "شما دسترسی به حذف کلاس این مدرسه را ندارید" }, { status: 403 });
    }
    
    await Class.findByIdAndDelete(validClassId);
    
    return Response.json({ message: "کلاس با موفقیت حذف شد" });
    
  } catch (error) {
    console.error("Error deleting class:", error);
    return Response.json({ error: "خطا در حذف کلاس" }, { status: 500 });
  }
}