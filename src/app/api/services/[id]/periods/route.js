// app/api/services/[id]/periods/route.js (بروزرسانی شده کامل)
import { connectDB } from "../../../../../lib/db";
import Period from "../../../../../models/Periods";
import Service from "../../../../../models/Service";
import Enrollment from "../../../../../models/Enrollment";
import Payment from "../../../../../models/Payment";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET;

// Helper function to generate tracking code
function generateTrackingCode() {
  return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
}

// Function to create payments for all enrolled students in a period
async function createPaymentsForPeriod(periodId, serviceId, amount) {
  try {
    // Find all enrollments for this service
    const enrollments = await Enrollment.find({ 
      service: serviceId,
      paymentStatus: { $in: ['paid', 'pending'] }
    }).populate('user');
    
    console.log(`📊 Creating payments for ${enrollments.length} students in period ${periodId}`);
    
    const payments = [];
    let createdCount = 0;
    let skippedCount = 0;
    
    for (const enrollment of enrollments) {
      // Check if payment already exists for this period
      const existingPayment = await Payment.findOne({
        user: enrollment.user._id,
        service: serviceId,
        forPeriodId: periodId
      });
      
      if (existingPayment) {
        skippedCount++;
        continue;
      }
      
      const trackingCode = generateTrackingCode();
      
      const payment = new Payment({
        user: enrollment.user._id,
        service: serviceId,
        enrollment: enrollment._id,
        amount: amount,
        netAmount: amount,
        type: 'full',
        installmentNumber: 1,
        dueDate: new Date(), // Will be updated when period is activated
        status: 'pending',
        forPeriodId: periodId,
        trackingCode,
        paidToCreator: false
      });
      
      await payment.save();
      payments.push(payment);
      createdCount++;
    }
    
    console.log(`✅ Created ${createdCount} payments, skipped ${skippedCount} (already existed)`);
    return { createdCount, skippedCount, payments };
    
  } catch (error) {
    console.error("Error creating payments for period:", error);
    throw error;
  }
}

// GET endpoint - existing code
export async function GET(request, { params }) {
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
    const periods = await Period.find({ service: serviceId }).lean();
    return NextResponse.json({ periods });
  } catch (error) {
    console.error("خطا در دریافت ترم‌ها:", error);
    return NextResponse.json(
      { error: "خطا در دریافت ترم‌ها" },
      { status: 500 }
    );
  }
}

// POST endpoint - Create new period
export async function POST(request, { params }) {
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
    const body = await request.json();
    const { durationDays } = body;
    
    if (!durationDays || durationDays <= 0) {
      return NextResponse.json(
        { error: "مدت زمان ترم معتبر نیست" },
        { status: 400 }
      );
    }
    
    // Check if service exists
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
    
    // Deactivate current active periods
    await Period.updateMany(
      { service: serviceId, isActive: true },
      { $set: { isActive: false } }
    );
    
    // Calculate new period dates
    const lastPeriod = await Period.findOne({ service: serviceId }).sort({ endDate: -1 });
    let startDate = new Date();
    
    if (lastPeriod) {
      // Start from the end of last period
      startDate = new Date(lastPeriod.endDate);
      startDate.setDate(startDate.getDate() + 1);
    }
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + durationDays);
    
    // Create new period
    const period = new Period({
      startDate,
      endDate,
      service: serviceId,
      durationDays,
      isActive: true,
      isAutoCreated: false,
      paymentsCreated: false
    });
    
    await period.save();
    
    // Get the price for payments (use service price after discount)
    const priceAmount = service.priceAfterDiscount || service.price;
    
    // Create payments for all enrolled students
    const { createdCount, skippedCount } = await createPaymentsForPeriod(period._id, serviceId, priceAmount);
    
    // Mark payments as created
    period.paymentsCreated = true;
    await period.save();
    
    return NextResponse.json({
      message: "ترم جدید با موفقیت ایجاد شد",
      period,
      paymentsCreated: createdCount,
      paymentsSkipped: skippedCount
    });
    
  } catch (error) {
    console.error("Error creating period:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد ترم" },
      { status: 500 }
    );
  }
}