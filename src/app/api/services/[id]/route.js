// app/api/services/[id]/route.js
import { connectDB } from "../../../../lib/db";
import Service from "../../../../models/Service";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
import mongoose from "mongoose";
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
    console.log("🔍 جستجوی خدمت با ID:", serviceId);
    console.log("👤 کاربر جاری:", decoded.id);
    if (!mongoose.Types.ObjectId.isValid(serviceId)) {
      return new Response(
        JSON.stringify({ error: "شناسه خدمت نامعتبر است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const service = await Service.findById(serviceId);
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

    return new Response(JSON.stringify({ 
      success: true,
      service,
      registrationWithoutQuiz: service.settings?.registrationWithoutQuiz
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت خدمت" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}