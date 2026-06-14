import { connectDB } from "../../../lib/db";
import Score from "../../../models/Score";
import Period from "../../../models/Periods";
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
    } catch (error) {
      return Response.json(
        { error: "توکن نامعتبر است" }, 
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');
    const forPeriodId = searchParams.get('forPeriodId');

    // 🔥 رفع باگ کرش سرور: اعتبارسنجی فرمت شناسه در کوئری پارامترها
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return Response.json({ error: "فرمت شناسه کاربر نامعتبر است" }, { status: 400 });
    }
    if (forPeriodId && !mongoose.Types.ObjectId.isValid(forPeriodId)) {
      return Response.json({ error: "فرمت شناسه دوره نامعتبر است" }, { status: 400 });
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

    if (forPeriodId) {
      query.forPeriodId = new mongoose.Types.ObjectId(forPeriodId);
    }

    const scores = await Score.find(query)
      .populate('user', 'firstname lastname')
      .populate('forPeriodId', 'startDate endDate')
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
    } catch (error) {
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
    const { user, service, forPeriodId, details } = body;

    if (!user || !service || !forPeriodId) {
      return Response.json(
        { error: "فیلدهای user, service و forPeriodId الزامی هستند" },
        { status: 400 }
      );
    }

    // 🔥 رفع باگ کرش سرور: اعتبارسنجی مقادیر ارسالی بدنه درخواست
    if (!mongoose.Types.ObjectId.isValid(user) || !mongoose.Types.ObjectId.isValid(service) || !mongoose.Types.ObjectId.isValid(forPeriodId)) {
      return Response.json(
        { error: "فرمت شناسه‌های ارسال شده نامعتبر است" },
        { status: 400 }
      );
    }

    const newScore = new Score({
      user: new mongoose.Types.ObjectId(user),
      service: new mongoose.Types.ObjectId(service),
      forPeriodId: new mongoose.Types.ObjectId(forPeriodId),
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
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر است" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user');
    const forPeriodId = searchParams.get('forPeriodId');

    if (!userId || !forPeriodId) {
      return new Response(
        JSON.stringify({ error: "فیلدهای user و forPeriodId الزامی هستند" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 🔥 رفع باگ کرش سرور: اعتبارسنجی اولیه فرمت ObjectIdها
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(forPeriodId)) {
      return new Response(
        JSON.stringify({ error: "فرمت شناسه کاربر یا دوره نامعتبر است" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 🔥 رفع باگ دسترسی (Privilege Escalation): کاربران عادی به هیچ وجه نباید بتوانند نمرات خود را تغییر دهند.
    const requestingUser = await User.findById(decoded.id);
    if (!requestingUser || requestingUser.type !== 'creator') {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز. فقط ادمین‌ها و سازندگان می‌توانند نمرات را ویرایش کنند" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { details, service } = body;

    if (!details || !service) {
      return new Response(
        JSON.stringify({ error: "فیلدهای details و service الزامی هستند" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(service)) {
      return new Response(
        JSON.stringify({ error: "فرمت شناسه خدمت نامعتبر است" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const score = await Score.findOne({
      user: new mongoose.Types.ObjectId(userId),
      forPeriodId: new mongoose.Types.ObjectId(forPeriodId)
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
        service: new mongoose.Types.ObjectId(service),
        forPeriodId: new mongoose.Types.ObjectId(forPeriodId),
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