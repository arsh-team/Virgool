// app/api/creator/services/route.js
import { connectDB } from "../../../../lib/db";
import Service from "../../../../models/Service";
import Enrollment from "../../../../models/Enrollment";
import User from "../../../../models/User";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
export async function GET(request) {
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
    const userId = decoded.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(
        JSON.stringify({ error: "شناسه کاربر نامعتبر است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    const user = await User.findById(userId);
    if (!user || user.type !== 'creator') {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز" }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    console.log(`جستجوی خدمات برای کاربر: ${userId}`);
    const services = await Service.find({ 
      fromUserId: new mongoose.Types.ObjectId(userId) 
    }).sort({ createdAt: -1 });
    console.log(`تعداد خدمات یافت شده: ${services.length}`);
    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const enrollments = await Enrollment.find({ 
          service: service._id,
          paymentStatus: 'paid'
        });
        const revenue = enrollments.reduce((sum, _enrollment) => {
          const price = service.priceAfterDiscount || service.price;
          return sum + price;
        }, 0);
        const platformFee = revenue * 0.05;
        const netRevenue = revenue - platformFee;
        return {
          ...service.toObject(),
          enrollmentsCount: enrollments.length,
          revenue,
          platformFee,
          netRevenue
        };
      })
    );
    return new Response(JSON.stringify({ services: servicesWithStats }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching creator services:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت خدمات" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}