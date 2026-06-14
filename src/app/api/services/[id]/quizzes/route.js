import { connectDB } from "../../../../../lib/db";
import Quiz from "../../../../../models/Quiz";
import Service from "../../../../../models/Service";
import { getJwtSecret } from "../../../../../lib/auth";
import jwt from "jsonwebtoken";
export async function GET(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;
    const service = await Service.findById(serviceId).populate('fromUserId');
    if (!service) {
      console.log("❌ خدمت یافت نشد");
      return new Response(
        JSON.stringify({ error: "خدمت یافت نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const isOwner = service.fromUserId && 
                   service.fromUserId._id.toString() === decoded.id;
    if (!isOwner) {
      console.log("❌ کاربر مالک خدمت نیست");
      return new Response(
        JSON.stringify({ error: "شما دسترسی به این خدمت ندارید" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log("✅ کاربر مالک خدمت است");
    const quizzes = await Quiz.find({ 
      service: serviceId,
      createdBy: decoded.id 
    }).sort({ createdAt: -1 });
    console.log(`📊 تعداد آزمون‌های یافت شده: ${quizzes.length}`);
    return new Response(JSON.stringify({ quizzes }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error fetching quizzes:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت آزمون‌ها" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
export async function POST(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;
    const service = await Service.findById(serviceId).populate('fromUserId');
    if (!service) {
      console.log("❌ خدمت یافت نشد");
      return new Response(
        JSON.stringify({ error: "خدمت یافت نشد" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const isOwner = service.fromUserId && 
                   service.fromUserId._id.toString() === decoded.id;
    if (!isOwner) {
      console.log("❌ کاربر مالک خدمت نیست");
      return new Response(
        JSON.stringify({ error: "شما دسترسی به این خدمت ندارید" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const body = await request.json();
    console.log("📝 داده‌های دریافتی:", {
      title: body.title,
      questionsCount: body.questions?.length || 0
    });
    if (!body.title || body.title.trim() === '') {
      return new Response(
        JSON.stringify({ error: "عنوان آزمون الزامی است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const quizData = {
      title: body.title.trim(),
      description: body.description?.trim() || '',
      timeLimit: body.timeLimit || 30,
      passingScore: body.passingScore || 70,
      maxAttempts: body.maxAttempts || 3,
      isActive: body.isActive !== undefined ? body.isActive : true,
      questions: body.questions || [],
      service: serviceId,
      createdBy: decoded.id
    };
    const quiz = new Quiz(quizData);
    await quiz.save();
    console.log("✅ آزمون با موفقیت ایجاد شد:", quiz._id);
    return new Response(
      JSON.stringify({ 
        quiz,
        message: "آزمون با موفقیت ایجاد شد" 
      }), 
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("❌ Error creating quiz:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return new Response(
        JSON.stringify({ error: errors.join(', ') }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: "خطا در ایجاد آزمون" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}