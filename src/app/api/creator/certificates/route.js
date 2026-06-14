// app/api/creator/certificates/route.js
import { connectDB } from "../../../../lib/db";
import { getUserIdFromToken } from "../../../../lib/auth";
import CertificateTemplate from "../../../../models/CertificateTemplate";
import User from "../../../../models/User";
import Service from "../../../../models/Service";

export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await User.findById(userId);
    if (!user || user.type !== 'creator') {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    
    let query = {};
    if (schoolId) {
      const service = await Service.findOne({ _id: schoolId, fromUserId: userId });
      if (!service) {
        return new Response(
          JSON.stringify({ error: "شما دسترسی به این مدرسه ندارید" }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      query.school = schoolId;
    } else {
      // When no schoolId, only return templates for schools the creator owns
      const creatorServices = await Service.find({ fromUserId: userId }).select('_id');
      query.school = { $in: creatorServices.map(s => s._id) };
    }

    const templates = await CertificateTemplate.find(query).sort({ createdAt: -1 });

    return new Response(
      JSON.stringify({ templates }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error fetching certificate templates:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت قالب‌های گواهی‌نامه" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = await User.findById(userId);
    if (!user || user.type !== 'creator') {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { name, description, type, templateData } = body;
    const school = body.school;

    if (!name || !school) {
      return new Response(
        JSON.stringify({ error: "نام و مدرسه الزامی است" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const service = await Service.findOne({ _id: school, fromUserId: userId });
    if (!service) {
      return new Response(
        JSON.stringify({ error: "شما دسترسی به این مدرسه ندارید" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const template = await CertificateTemplate.create({
      name,
      description,
      school,
      type: type || 'achievement',
      templateData: templateData || {}
    });

    return new Response(
      JSON.stringify({ template }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error creating certificate template:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ایجاد قالب گواهی‌نامه" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
