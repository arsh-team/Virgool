import { connectDB } from "../../../../../lib/db";
import Service from "../../../../../models/Service";
import Enrollment from "../../../../../models/Enrollment";
import Payment from "../../../../../models/Payment";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";

export async function POST(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر است" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id: serviceId } = await params;
    const userId = decoded.id;
    
    const service = await Service.findById(serviceId);
    if (!service) {
      return new Response(
        JSON.stringify({ error: "خدمت یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      service: serviceId
    });
    
    if (existingEnrollment) {
      return new Response(
        JSON.stringify({ error: "شما قبلاً در این خدمت ثبت‌نام کرده‌اید" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    if (service.maxCapacity > 0) {
      const enrolledCount = await Enrollment.countDocuments({ service: serviceId });
      if (enrolledCount >= service.maxCapacity) {
        return new Response(
          JSON.stringify({ error: "ظرفیت این خدمت تکمیل شده است" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    const priceAfterDiscount = service.priceAfterDiscount || service.price;
    
    const enrollment = new Enrollment({
      user: userId,
      service: serviceId,
      amount: priceAfterDiscount,
      paymentStatus: 'pending',
      enrolledAt: new Date()
    });
    
    await enrollment.save();
    
    await Service.findByIdAndUpdate(serviceId, {
      $inc: { studentsCount: 1 }
    });

    const trackingCode = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    const payment = new Payment({
      user: userId,
      service: serviceId,
      enrollment: enrollment._id,
      amount: priceAfterDiscount,
      netAmount: priceAfterDiscount,
      type: 'full',
      status: 'pending',
      trackingCode
    });
    
    await payment.save();
    
    return new Response(
      JSON.stringify({
        message: "ثبت‌نام با موفقیت انجام شد",
        enrollment,
        payment: {
          _id: payment._id,
          amount: payment.amount,
          status: payment.status
        }
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error enrolling in service:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ثبت‌نام" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
