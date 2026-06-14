// app/api/services/[id]/periods/extend/route.js
import { connectDB } from "../../../../../../lib/db";
import Period from "../../../../../../models/Periods";
import Service from "../../../../../../models/Service";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const SECRET = process.env.JWT_SECRET;

export async function PUT(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
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
      return Response.json({ error: "سرویس یافت نشد" }, { status: 404 });
    }
    if (service.fromUserId.toString() !== decoded.id) {
      return Response.json({ error: "شما دسترسی به این عملیات ندارید" }, { status: 403 });
    }

    const body = await request.json();

    // پیدا کردن ترم فعال فعلی
    const activePeriod = await Period.findOne({ 
      service: serviceId, 
      isActive: true 
    }).lean();

    if (!activePeriod) {
      return NextResponse.json(
        { error: "هیچ ترم فعالی یافت نشد" },
        { status: 404 }
      );
    }

    // محاسبه تعداد روزهای اضافه شده
    const additionalDays = Number(body.additionalDays) || 0;
    
    if (additionalDays <= 0) {
      return NextResponse.json(
        { error: "تعداد روزهای اضافه شده باید بزرگتر از صفر باشد" },
        { status: 400 }
      );
    }

    // محاسبه تاریخ پایان جدید
    const currentEndDate = new Date(activePeriod.endDate);
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(currentEndDate.getDate() + additionalDays);

    // به‌روزرسانی ترم فعلی
    const updatedPeriod = await Period.findByIdAndUpdate(
      activePeriod._id,
      { endDate: newEndDate },
      { new: true }
    );

    return NextResponse.json({ 
      message: `ترم فعلی با موفقیت به مدت ${additionalDays} روز تمدید شد`,
      period: updatedPeriod
    }, { status: 200 });

  } catch (error) {
    console.error("خطا در تمدید ترم:", error);
    return NextResponse.json(
      { error: "خطا در تمدید ترم" },
      { status: 500 }
    );
  }
}