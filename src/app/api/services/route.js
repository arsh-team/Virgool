// app/api/services/route.js
import { connectDB } from "../../../lib/db";
import Service from "../../../models/Service";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../../../models/User";

const SECRET = process.env.JWT_SECRET;

function generateSlug(title) {
  return title
    .trim()
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "")
    .replace(/\s+/g, "-")
    .toLowerCase();
}

async function authenticate(request) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  
  const token = authHeader.replace("Bearer ", "");
  
  try {
    const decoded = jwt.verify(token, SECRET);
    return { userId: decoded.id };
  } catch (error) {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "توکن احراز هویت یافت نشد" }, { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch {
      return Response.json({ error: "توکن نامعتبر است" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get("creatorId");
    const type = searchParams.get("type");
    
    let query = {};
    if (creatorId) {
      query.fromUserId = creatorId;
    }
    if (type === "school") {
      query.category = "آموزشی";
    }
    
    const services = await Service.find(query)
      .populate("creator", "firstname lastname")
      .sort({ createdAt: -1 });
    
    return Response.json({ services });
  } catch (error) {
    console.error("Error fetching services:", error);
    return Response.json({ error: "خطا در دریافت خدمات" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        {
          status: auth.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    const userId = auth.userId;
    
    const user = await User.findById(userId);
    if (!user || user.type !== 'creator') {
      return Response.json(
        { error: "فقط حساب‌های سازنده می‌توانند سرویس ایجاد کنند" },
        { status: 403 }
      );
    }
    
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(
        JSON.stringify({ error: "فرمت داده ارسالی نامعتبر است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    console.log("دریافت داده برای ایجاد خدمت:", body);
    
    if (!body.title || !body.category || !body.serviceType || !body.description || !body.poster) {
      return new Response(
        JSON.stringify({ error: "فیلدهای ضروری را پر کنید" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    if (body.serviceType === "حضوری" || body.serviceType === "هیبریدی") {
      if (!body.address) {
        return new Response(
          JSON.stringify({ error: "آدرس برای خدمات حضوری الزامی است" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
    
    if (body.serviceType === "غیرحضوری" || body.serviceType === "هیبریدی") {
      if (!body.onlineMethod) {
        return new Response(
          JSON.stringify({ error: "روش انجام خدمات غیرحضوری الزامی است" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
    
    if (body.category === "آموزشی") {
      if (!body.instructor || !body.sessionDuration) {
        return new Response(
          JSON.stringify({ error: "اطلاعات آموزشی را کامل کنید" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
    
    const baseSlug = generateSlug(body.title);
    let slug = baseSlug;
    let counter = 1;
    
    while (await Service.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    const serviceData = {
      title: body.title,
      slug: slug,
      category: body.category,
      serviceType: body.serviceType,
      description: body.description,
      instructor: body.instructor || null,
      instructorBio: body.instructorBio || null,
      instructorImage: body.instructorImage || null,
      poster: body.poster,
      videoPreview: body.videoPreview || null,
      address: body.address || null,
      onlineMethod: body.onlineMethod || null,
      sessionsCount: Number(body.sessionsCount) || 1,
      sessionDuration: body.sessionDuration || null,
      level: body.level || null,
      price: Number(body.price) || 0,
      discountPercentage: Number(body.discountPercentage) || 0,
      features: Array.isArray(body.features) ? body.features : [],
      prerequisites: Array.isArray(body.prerequisites) ? body.prerequisites : [],
      whatYouLearn: Array.isArray(body.whatYouLearn) ? body.whatYouLearn : [],
      fromUserId: new mongoose.Types.ObjectId(userId),
      creator: new mongoose.Types.ObjectId(userId),
      status: "در انتظار تایید",
      isActive: true,
      viewCount: 0,
      likeCount: 0,
      commentCount: 0
    };
    
    const service = new Service(serviceData);
    await service.save();
    
    console.log("خدمت با موفقیت ایجاد شد:", service._id);
    
    return new Response(
      JSON.stringify({ 
        message: "خدمت با موفقیت ایجاد شد",
        service: service 
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
    
  } catch (error) {
    console.error("Error creating service:", error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return new Response(
        JSON.stringify({ error: "خطای اعتبارسنجی", details: errors }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({ error: "این خدمت قبلاً ثبت شده است" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "خطا در ایجاد خدمت" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}