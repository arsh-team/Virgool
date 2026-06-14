// app/api/school/educational-content/route.js
import { connectDB } from "../../../../lib/db";
import EducationalContent from "../../../../models/EducationalContent";
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

function extractObjectId(value) {
  if (!value) return null;
  
  // اگر از قبل ObjectId است
  if (value instanceof mongoose.Types.ObjectId) {
    return value;
  }
  
  // اگر رشته است
  if (typeof value === 'string') {
    // حذف فاصله‌ها و نرمالایز کردن
    const cleanValue = value.trim();
    
    // اگر دقیقاً برابر [object Object] است
    if (cleanValue === '[object Object]') {
      console.log("⚠️ Received [object Object] string - trying to recover...");
      // سعی می‌کنیم از جاهای دیگه مثل هدرها یا کوکی‌ها پیدا کنیم
      return null; // نمی‌تونیم recover کنیم، برمی‌گردونیم null
    }
    
    // اگر حاوی [object Object] هست ولی چیزهای دیگه هم داره
    if (cleanValue.includes('[object Object]')) {
      // تلاش برای استخراج با رجکس
      const match = cleanValue.match(/[a-fA-F0-9]{24}/);
      if (match) {
        console.log("✅ Extracted ObjectId from malformed string:", match[0]);
        return new mongoose.Types.ObjectId(match[0]);
      }
      return null;
    }
    
    // بررسی فرمت ObjectId معتبر (24 کاراکتر هگزادسیمال)
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

// تابع برای پیدا کردن classId از منابع مختلف
async function findClassIdFromRequest(request, searchParams) {
  // 1. اول از پارامترهای URL
  let classId = searchParams.get("classId");
  if (classId && classId !== '[object Object]') {
    const extracted = extractObjectId(classId);
    if (extracted) return extracted;
  }
  
  // 2. از بدنه درخواست (برای POST)
  try {
    const clonedRequest = request.clone();
    const body = await clonedRequest.json().catch(() => null);
    if (body && body.classId) {
      const extracted = extractObjectId(body.classId);
      if (extracted) return extracted;
    }
  } catch (_e) {
    // ignore
  }
  
  // 3. از هدرها
  const classIdHeader = request.headers.get("x-class-id");
  if (classIdHeader) {
    const extracted = extractObjectId(classIdHeader);
    if (extracted) return extracted;
  }
  
  // 4. از کوکی‌ها
  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/selectedClassId=([^;]+)/);
    if (match && match[1]) {
      const extracted = extractObjectId(decodeURIComponent(match[1]));
      if (extracted) return extracted;
    }
  }
  
  return null;
}

export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    let rawClassId = searchParams.get("classId");
    
    console.log("📌 Received classId:", rawClassId, "Type:", typeof rawClassId);
    
    if (!rawClassId) {
      return Response.json({ 
        content: [], 
        count: 0, 
        error: "شناسه کلاس یافت نشد" 
      }, { status: 200 });
    }
    
    // اگر classId به صورت [object Object] اومده، سعی می‌کنیم از راه دیگه پیدا کنیم
    let validClassId = null;
    
    if (rawClassId === '[object Object]') {
      console.log("⚠️ Received [object Object], trying to recover from other sources...");
      validClassId = await findClassIdFromRequest(request, searchParams);
      
      if (!validClassId) {
        // اگر نتونستیم recover کنیم، از کاربر لاگین شده سعی می‌کنیم کلاسش رو پیدا کنیم
        const user = await User.findById(auth.userId).populate('studentInfo.enrolledClass teacherInfo.classes');
        
        if (user?.studentInfo?.enrolledClass) {
          validClassId = user.studentInfo.enrolledClass._id;
          console.log("✅ Found class from user profile:", validClassId);
        } else if (user?.teacherInfo?.classes?.length > 0) {
          validClassId = user.teacherInfo.classes[0]._id;
          console.log("✅ Found class from teacher profile:", validClassId);
        }
      }
    } else {
      validClassId = extractObjectId(rawClassId);
    }
    
    if (!validClassId) {
      console.error("❌ Could not extract valid classId from any source");
      // به جای خطا، محتوای همه کلاس‌ها رو برمی‌گردونیم یا آرایه خالی
      return Response.json({ 
        content: [], 
        count: 0, 
        warning: "شناسه کلاس نامعتبر است",
        debug: { receivedClassId: rawClassId }
      }, { status: 200 });
    }
    
    console.log("✅ Using classId:", validClassId.toString());
    
    // جستجوی محتوای آموزشی
    const content = await EducationalContent.find({ 
      classId: validClassId 
    })
    .sort({ order: 1, createdAt: -1 })
    .lean();
    
    console.log(`📚 Found ${content.length} educational content items`);
    
    return Response.json({ 
      content, 
      count: content.length,
      classId: validClassId.toString()
    });
    
  } catch (error) {
    console.error("❌ Error fetching educational content:", error);
    // همیشه یک آرایه خالی برگردون تا فرانت‌اند کرش نکنه
    return Response.json({ 
      content: [], 
      count: 0 
    }, { status: 200 });
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
    let { title, description, videoUrl, type, order, isPublished, schoolId, classId } = body;
    
    // اعتبارسنجی فیلدهای الزامی
    if (!classId) {
      return Response.json({ error: "شناسه کلاس الزامی است" }, { status: 400 });
    }
    
    if (!title || !title.trim()) {
      return Response.json({ error: "عنوان محتوا الزامی است" }, { status: 400 });
    }
    
    if (!videoUrl || !videoUrl.trim()) {
      return Response.json({ error: "لینک ویدیو الزامی است" }, { status: 400 });
    }
    
    // تبدیل خودکار classId - حتی اگر [object Object] باشه
    let validClassId = extractObjectId(classId);
    
    // اگر نتونستیم استخراج کنیم، از پروفایل کاربر پیدا می‌کنیم
    if (!validClassId && (classId === '[object Object]' || String(classId).includes('[object Object]'))) {
      const user = await User.findById(auth.userId).populate('studentInfo.enrolledClass teacherInfo.classes');
      
      if (user?.studentInfo?.enrolledClass) {
        validClassId = user.studentInfo.enrolledClass._id;
      } else if (user?.teacherInfo?.classes?.length > 0) {
        validClassId = user.teacherInfo.classes[0]._id;
      }
    }
    
    if (!validClassId) {
      return Response.json({ error: "شناسه کلاس نامعتبر است" }, { status: 400 });
    }
    
    // تبدیل خودکار schoolId
    let validSchoolId = null;
    if (schoolId) {
      validSchoolId = extractObjectId(schoolId);
    }
    
    // ایجاد محتوای جدید
    const content = new EducationalContent({
      title: title.trim(),
      description: description?.trim() || "",
      videoUrl: videoUrl.trim(),
      type: type || "video",
      order: order || 0,
      isPublished: isPublished !== undefined ? isPublished : true,
      classId: validClassId,
      schoolId: validSchoolId,
      createdBy: auth.userId
    });
    
    await content.save();
    
    console.log(`✅ Educational content created: ${content.title}`);
    
    return Response.json({ 
      content, 
      message: "محتوای آموزشی با موفقیت اضافه شد" 
    }, { status: 201 });
    
  } catch (error) {
    console.error("❌ Error creating educational content:", error);
    return Response.json({ error: "خطا در ایجاد محتوا" }, { status: 500 });
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
    let contentId = searchParams.get("id");
    
    if (!contentId) {
      return Response.json({ error: "شناسه محتوا الزامی است" }, { status: 400 });
    }
    
    const validContentId = extractObjectId(contentId);
    if (!validContentId) {
      return Response.json({ error: "شناسه محتوا نامعتبر است" }, { status: 400 });
    }
    
    const body = await request.json();
    const { title, description, videoUrl, type, order, isPublished, classId } = body;
    
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl.trim();
    if (type !== undefined) updateData.type = type;
    if (order !== undefined) updateData.order = order;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    
    if (classId) {
      const validClassId = extractObjectId(classId);
      if (!validClassId) {
        return Response.json({ error: "شناسه کلاس نامعتبر است" }, { status: 400 });
      }
      updateData.classId = validClassId;
    }
    
    const content = await EducationalContent.findByIdAndUpdate(
      validContentId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!content) {
      return Response.json({ error: "محتوای آموزشی یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ content, message: "محتوای آموزشی با موفقیت به‌روزرسانی شد" });
    
  } catch (error) {
    console.error("❌ Error updating educational content:", error);
    return Response.json({ error: "خطا در به‌روزرسانی محتوا" }, { status: 500 });
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
    let contentId = searchParams.get("id");
    
    if (!contentId) {
      return Response.json({ error: "شناسه محتوا الزامی است" }, { status: 400 });
    }
    
    const validContentId = extractObjectId(contentId);
    if (!validContentId) {
      return Response.json({ error: "شناسه محتوا نامعتبر است" }, { status: 400 });
    }
    
    const content = await EducationalContent.findByIdAndDelete(validContentId);
    
    if (!content) {
      return Response.json({ error: "محتوای آموزشی یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ message: "محتوای آموزشی با موفقیت حذف شد" });
    
  } catch (error) {
    console.error("❌ Error deleting educational content:", error);
    return Response.json({ error: "خطا در حذف محتوا" }, { status: 500 });
  }
}