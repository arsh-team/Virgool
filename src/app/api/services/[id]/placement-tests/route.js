import { connectDB } from "../../../../../lib/db";
import PlacementTest from "../../../../../models/PlacementTest";
import Service from "../../../../../models/Service";
import Quiz from "../../../../../models/Quiz";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";
export async function GET(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), { status: 401 });
    }
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;
    const service = await Service.findOne({
      _id: serviceId,
      fromUserId: decoded.id
    });
    if (!service) {
      return new Response(
        JSON.stringify({ error: "شما دسترسی به این خدمت ندارید" }),
        { status: 403 }
      );
    }
    const placementTests = await PlacementTest.find({ service: serviceId })
      .populate('quiz', 'title')
      .populate('levelRanges.service', 'title level category')
      .populate('createdBy', 'firstname lastname')
      .sort({ createdAt: -1 });
    return new Response(JSON.stringify({ placementTests }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching placement tests:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت آزمون‌های تعیین سطح" }),
      { status: 500 }
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
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), { status: 401 });
    }
    const resolvedParams = await params;
    const serviceId = resolvedParams.id;
    const body = await request.json();
    const service = await Service.findOne({
      _id: serviceId,
      fromUserId: decoded.id
    });
    if (!service) {
      return new Response(
        JSON.stringify({ error: "شما دسترسی به این خدمت ندارید" }),
        { status: 403 }
      );
    }
    const quiz = await Quiz.findOne({
      _id: body.quiz,
      createdBy: decoded.id
    });
    if (!quiz) {
      return new Response(
        JSON.stringify({ error: "آزمون یافت نشد یا دسترسی ندارید" }),
        { status: 404 }
      );
    }
    const { title, quiz: quizId, levelRanges } = body;
    const placementTest = new PlacementTest({
      title,
      quiz: quizId,
      levelRanges,
      service: serviceId,
      createdBy: decoded.id
    });
    await placementTest.save();
    await placementTest.populate('quiz', 'title');
    await placementTest.populate('levelRanges.service', 'title level category');
    await placementTest.populate('createdBy', 'firstname lastname');
    return new Response(JSON.stringify({ 
      placementTest,
      message: "آزمون تعیین سطح با موفقیت ایجاد شد" 
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating placement test:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return new Response(
        JSON.stringify({ error: errors.join(', ') }),
        { status: 400 }
      );
    }
    return new Response(
      JSON.stringify({ error: "خطا در ایجاد آزمون تعیین سطح" }),
      { status: 500 }
    );
  }
}