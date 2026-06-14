// app/api/services/[id]/periods/extend/route.js
import { connectDB } from "../../../../../../lib/db";
import Period from "../../../../../../models/Periods";
import Service from "../../../../../../models/Service";
import Enrollment from "../../../../../../models/Enrollment";
import Payment from "../../../../../../models/Payment";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET;

export async function PUT(request, { params }) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "توکن احراز هویت یافت نشد" },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, SECRET);
    } catch (_error) {
      return NextResponse.json(
        { error: "توکن نامعتبر است" },
        { status: 401 }
      );
    }
    
    const serviceId = params.id;
    
    // Ownership check
    const service = await Service.findById(serviceId);
    if (!service) {
      return NextResponse.json(
        { error: "سرویس یافت نشد" },
        { status: 404 }
      );
    }
    if (service.fromUserId.toString() !== decoded.id) {
      return NextResponse.json(
        { error: "شما دسترسی به این عملیات ندارید" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { additionalDays } = body;
    
    if (!additionalDays || additionalDays <= 0) {
      return NextResponse.json(
        { error: "تعداد روزهای اضافه معتبر نیست" },
        { status: 400 }
      );
    }
    
    const activePeriod = await Period.findOne({
      service: serviceId,
      isActive: true
    });
    
    if (!activePeriod) {
      return NextResponse.json(
        { error: "ترم فعالی یافت نشد" },
        { status: 404 }
      );
    }
    
    // Extend the current period
    const newEndDate = new Date(activePeriod.endDate);
    newEndDate.setDate(newEndDate.getDate() + additionalDays);
    
    activePeriod.endDate = newEndDate;
    await activePeriod.save();
    
    // Update due dates for all pending payments of this period
    await Payment.updateMany(
      {
        forPeriodId: activePeriod._id,
        status: 'pending'
      },
      {
        $set: { dueDate: newEndDate }
      }
    );
    
    // Get service price (reuse existing service)
    const _priceAmount = service.priceAfterDiscount || service.price;
    
    // Create new period for the next term if needed
    const nextPeriodStart = new Date(newEndDate);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + 1);
    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + activePeriod.durationDays);
    
    const nextPeriod = new Period({
      startDate: nextPeriodStart,
      endDate: nextPeriodEnd,
      service: serviceId,
      durationDays: activePeriod.durationDays,
      isActive: false,
      isAutoCreated: true,
      paymentsCreated: false
    });
    
    await nextPeriod.save();
    
    return NextResponse.json({
      message: "ترم با موفقیت تمدید شد و ترم جدید ایجاد گردید",
      activePeriod: {
        startDate: activePeriod.startDate,
        endDate: activePeriod.endDate,
        durationDays: activePeriod.durationDays
      },
      nextPeriod: {
        startDate: nextPeriod.startDate,
        endDate: nextPeriod.endDate
      }
    });
    
  } catch (error) {
    console.error("Error extending period:", error);
    return NextResponse.json(
      { error: "خطا در تمدید ترم" },
      { status: 500 }
    );
  }
}