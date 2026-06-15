import { connectDB } from "../../../lib/db";
import Score from "../../../models/Score";
import User from "../../../models/User";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { getJwtSecret } from "../../../lib/auth";

export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: "توکن احراز هویت یافت نشد" }, 
        { status: 401 }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return Response.json(
        { error: "توکن نامعتبر است" }, 
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');
    const serviceId = searchParams.get('service');

    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return Response.json({ error: "فرمت شناسه کاربر نامعتبر است" }, { status: 400 });
    }
    if (serviceId && !mongoose.Types.ObjectId.isValid(serviceId)) {
      return Response.json({ error: "فرمت شناسه خدمت نامعتبر است" }, { status: 400 });
    }

    let query = {};
    const requestingUser = await User.findById(decoded.id);
    if (!requestingUser) {
      return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    if (requestingUser.type === 'creator') {
      if (userId) {
        query.user = new mongoose.Types.ObjectId(userId);
      }
    } else {
      query.user = new mongoose.Types.ObjectId(decoded.id);
    }

    if (serviceId) {
      query.service = new mongoose.Types.ObjectId(serviceId);
    }

    const scores = await Score.find(query)
      .populate('user', 'firstname lastname')
      .lean();

    return Response.json(scores);
  } catch (error) {
    console.error("Error fetching scores:", error);
    return Response.json(
      { error: "خطا در دریافت نمرات" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: "توکن احراز هویت یافت نشد" }, 
        { status: 401 }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return Response.json(
        { error: "توکن نامعتبر است" }, 
        { status: 401 }
      );
    }

    const requestingUser = await User.findById(decoded.id);
    if (!requestingUser || requestingUser.type !== 'creator') {
      return Response.json({ error: "شما دسترسی ثبت نمره ندارید" }, { status: 403 });
    }

    const body = await request.json();
    const { user, service, details } = body;

    if (!user || !service) {
      return Response.json(
        { error: "فیلدهای user و service الزامی هستند" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(service)) {
      return Response.json(
        { error: "فرمت شناسه‌های ارسال شده نامعتبر است" },
        { status: 400 }
      );
    }

    const newScore = new Score({
      user: new mongoose.Types.ObjectId(user),
      service: new mongoose.Types.ObjectId(service),
      details: details || []
    });

    const savedScore = await newScore.save();
    return Response.json(savedScore, { status: 201 });
  } catch (error) {
    console.error("Error creating score:", error);
    return Response.json(
      { error: "خطا در ایجاد نمره" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر است" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');
    const serviceId = searchParams.get('service');

    if (!userId || !serviceId) {
      return new Response(
        JSON.stringify({ error: "فیلدهای user و service الزامی هستند" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(serviceId)) {
      return new Response(
        JSON.stringify({ error: "فرمت شناسه کاربر یا خدمت نامعتبر است" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const requestingUser = await User.findById(decoded.id);
    if (!requestingUser || requestingUser.type !== 'creator') {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز. فقط ادمین‌ها و سازندگان می‌توانند نمرات را ویرایش کنند" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { details } = body;

    if (!details) {
      return new Response(
        JSON.stringify({ error: "فیلد details الزامی است" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const score = await Score.findOne({
      user: new mongoose.Types.ObjectId(userId),
      service: new mongoose.Types.ObjectId(serviceId)
    });

    if (score) {
      score.details = details;
      await score.save();
      return new Response(
        JSON.stringify(score),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } else {
      const newScore = new Score({
        user: new mongoose.Types.ObjectId(userId),
        service: new mongoose.Types.ObjectId(serviceId),
        details: details
      });
      const savedScore = await newScore.save();
      return new Response(
        JSON.stringify(savedScore),
        { status: 201, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error("Error updating score:", error);
    return new Response(
      JSON.stringify({ error: "خطا در به‌روزرسانی نمره" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
