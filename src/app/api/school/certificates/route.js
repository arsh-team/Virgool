// app/api/school/certificates/route.js
import { connectDB } from "../../../../lib/db";
import jwt from "jsonwebtoken";
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

export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const body = await request.json();
    const { 
      studentId, 
      schoolId, 
      template, 
      reason, 
      customText, 
      competitionName, 
      competitionField, 
      date, 
      signer,
      academicYear
    } = body;
    
    if (!studentId || !schoolId || !template || !reason) {
      return Response.json({ 
        error: "پارامترهای studentId، schoolId، template و reason الزامی هستند" 
      }, { status: 400 });
    }
    
    // اعتبارسنجی قالب
    const validTemplates = ["classic", "modern", "islamic"];
    if (!validTemplates.includes(template)) {
      return Response.json({ 
        error: "قالب نامعتبر. قالب‌های مجاز: classic, modern, islamic" 
      }, { status: 400 });
    }
    
    // اعتبارسنجی دلیل
    const validReasons = ["top_student", "competition", "excellence", "behavior"];
    if (!validReasons.includes(reason)) {
      return Response.json({ 
        error: "دلیل نامعتبر. دلایل مجاز: top_student, competition, excellence, behavior" 
      }, { status: 400 });
    }
    
    // تولید متن لوح بر اساس دلیل
    let reasonText = "";
    switch (reason) {
      case "top_student":
        reasonText = `به عنوان دانش‌آموز برتر با میانگین نمرات عالی در سال تحصیلی ${academicYear || " جاری"}`;
        break;
      case "competition":
        if (!competitionName) {
          return Response.json({ 
            error: "برای دلیل مسابقه، وارد کردن نام مسابقه الزامی است" 
          }, { status: 400 });
        }
        reasonText = `به پاس کسب مقام ارزشمند در مسابقه ${competitionName} ${competitionField ? `در گرایش ${competitionField}` : ""}`;
        break;
      case "excellence":
        reasonText = `به پاس عملکرد درخشان و تلاش‌های ارزشمند شما در ${customText || "عرصه علم و دانش"}`;
        break;
      case "behavior":
        reasonText = `به پاس اخلاق حسنه و رفتار شایسته دانش‌آموزی در سال تحصیلی ${academicYear || " جاری"}`;
        break;
      default:
        reasonText = customText || "به پاس تلاش‌های ارزشمند شما";
    }
    
    // ساخت داده‌های لوح تقدیر
    const certificateData = {
      studentId,
      schoolId,
      template,
      reason,
      reasonText,
      customText: customText || "",
      competitionName: competitionName || "",
      competitionField: competitionField || "",
      date: date || new Date().toLocaleDateString("fa-IR"),
      signer: signer || "مدیریت مدرسه",
      academicYear: academicYear || "",
      createdAt: new Date()
    };
    
    return Response.json({ 
      success: true, 
      certificateData,
      message: "داده‌های لوح تقدیر با موفقیت تولید شد"
    });
    
  } catch (error) {
    console.error("Error generating certificate data:", error);
    return Response.json({ 
      error: "خطا در تولید داده‌های لوح تقدیر"
    }, { status: 500 });
  }
}
