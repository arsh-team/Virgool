// app/api/services/[id]/settings/route.js
import { connectDB } from "../../../../../lib/db";
import Service from "../../../../../models/Service";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";
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
    const service = await Service.findOne({
      _id: serviceId,
      $or: [
        { fromUserId: decoded.id },
        { creator: decoded.id }
      ]
    });
    if (!service) {
      return new Response(
        JSON.stringify({ error: "خدمت یافت نشد یا دسترسی ندارید" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(JSON.stringify({ settings: service.settings || {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching service settings:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت تنظیمات" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
export async function PUT(request, { params }) {
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
    const _body = await request.json();
    const service = await Service.findOne({
      _id: serviceId,
      $or: [
        { fromUserId: decoded.id },
        { creator: decoded.id }
      ]
    });
    if (!service) {
      return new Response(
        JSON.stringify({ error: "خدمت یافت نشد یا دسترسی ندارید" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(JSON.stringify({ settings: service.settings || {} }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating service settings:", error);
    return new Response(
      JSON.stringify({ error: "خطا در بروزرسانی تنظیمات" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}