// app/api/creator/enrollments/route.js
import { connectDB } from "../../../lib/db";
import Service from "../../../models/Service";
import Enrollment from "../../../models/Enrollment";
import User from "../../../models/User";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../lib/auth";
import Period from "../../../models/Periods";
import Payment from "../../../models/Payment";

export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "توکن احراز هویت یافت نشد" }, { status: 401 });
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return Response.json({ error: "توکن نامعتبر است" }, { status: 401 });
    }
    const userId = decoded.id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return Response.json({ error: "شناسه کاربر نامعتبر است" }, { status: 400 });
    }

    const userServices = await Service.find({ fromUserId: new mongoose.Types.ObjectId(userId) }).select("_id").lean();
    const serviceIds = userServices.map(s => s._id);

    let enrollments = [];
    if (serviceIds.length > 0) {
      enrollments = await Enrollment.find({ service: { $in: serviceIds } })
        .populate('user', 'firstname lastname email phone')
        .populate('service', 'title category price discountPercentage priceAfterDiscount')
        .sort({ enrolledAt: -1 })
        .lean();

      if (enrollments.length > 0) {
        const uniqueServiceIds = [...new Set(enrollments.map(e => e.service?._id).filter(Boolean))];
        const userIds = [...new Set(enrollments.map(e => e.user?._id).filter(Boolean))];

        const [latestPeriods, payments] = await Promise.all([
          Period.aggregate([
            { $match: { service: { $in: uniqueServiceIds } } },
            { $sort: { _id: -1 } },
            { $group: { _id: "$service", periodId: { $first: "$_id" } } },
          ]),
          Payment.find({
            user: { $in: userIds },
            service: { $in: uniqueServiceIds },
          })
            .select("user service forPeriodId status")
            .lean(),
        ]);

        const periodMap = new Map(latestPeriods.map(p => [p._id.toString(), p.periodId.toString()]));
        const paymentLookup = new Map();
        for (const pay of payments) {
          const key = `${pay.user.toString()}_${pay.service.toString()}`;
          paymentLookup.set(key, pay);
        }

        for (const enrollment of enrollments) {
          const serviceId = enrollment.service?._id?.toString();
          const userIdVal = enrollment.user?._id?.toString();
          if (!serviceId || !userIdVal) { enrollment.paymentStatus = 'pending'; continue; }
          const key = `${userIdVal}_${serviceId}`;
          const payment = paymentLookup.get(key);
          const latestPeriodId = periodMap.get(serviceId);
          if (payment && latestPeriodId) {
            enrollment.paymentStatus = (payment.forPeriodId?.toString() === latestPeriodId && payment.status === "paid") ? 'paid' : 'pending';
          } else {
            enrollment.paymentStatus = 'pending';
          }
        }
      }
    }

    const enrollmentsWithDetails = enrollments.map(enrollment => ({
      _id: enrollment._id,
      user: enrollment.user,
      service: enrollment.service,
      enrolledAt: enrollment.enrolledAt,
      amount: enrollment.service?.priceAfterDiscount || enrollment.service?.price || 0,
      paymentStatus: enrollment.paymentStatus,
      progress: enrollment.progress,
      completed: enrollment.completed,
      lastAccessed: enrollment.lastAccessed,
    }));
    return Response.json({ enrollments: enrollmentsWithDetails });
  } catch (error) {
    console.error("Error fetching creator enrollments:", error);
    return Response.json({ error: "خطا در دریافت ثبت‌نامی‌ها" }, { status: 500 });
  }
}
