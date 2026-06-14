// app/api/services/[id]/enroll/route.js
import { connectDB } from "../../../../../lib/db";
import Service from "../../../../../models/Service";
import Enrollment from "../../../../../models/Enrollment";
import Payment from "../../../../../models/Payment";
import Period from "../../../../../models/Periods";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";
import mongoose from "mongoose";

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
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر است" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { id: serviceId } = await params;
    const userId = decoded.id;
    
    // Check if service exists
    const service = await Service.findById(serviceId);
    if (!service) {
      return new Response(
        JSON.stringify({ error: "خدمت یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if already enrolled
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
    
    // Check capacity
    if (service.maxCapacity > 0) {
      const enrolledCount = await Enrollment.countDocuments({ service: serviceId });
      if (enrolledCount >= service.maxCapacity) {
        return new Response(
          JSON.stringify({ error: "ظرفیت این خدمت تکمیل شده است" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    // Calculate price with discount
    const priceAfterDiscount = service.priceAfterDiscount || service.price;
    
    // Create enrollment
    const enrollment = new Enrollment({
      user: userId,
      service: serviceId,
      amount: priceAfterDiscount,
      paymentStatus: 'pending',
      enrolledAt: new Date()
    });
    
    await enrollment.save();
    
    // Update service students count
    await Service.findByIdAndUpdate(serviceId, {
      $inc: { studentsCount: 1 }
    });
    
    // Find active period for this service
    const activePeriod = await Period.findOne({
      service: serviceId,
      isActive: true
    }).sort({ startDate: -1 });
    
    // If there's an active period, create payment for it
    if (activePeriod) {
      const existingPayment = await Payment.findOne({
        user: userId,
        service: serviceId,
        forPeriodId: activePeriod._id
      });
      
      if (!existingPayment) {
        const trackingCode = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
        
        const payment = new Payment({
          user: userId,
          service: serviceId,
          enrollment: enrollment._id,
          amount: priceAfterDiscount,
          netAmount: priceAfterDiscount,
          type: 'full',
          installmentNumber: 1,
          dueDate: activePeriod.endDate,
          status: 'pending',
          forPeriodId: activePeriod._id,
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
              dueDate: payment.dueDate,
              status: payment.status
            }
          }),
          { status: 201, headers: { "Content-Type": "application/json" } }
        );
      }
    }
    
    return new Response(
      JSON.stringify({
        message: "ثبت‌نام با موفقیت انجام شد",
        enrollment
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