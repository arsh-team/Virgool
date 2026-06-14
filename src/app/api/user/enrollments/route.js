// app/api/enrollments/route.js
import { connectDB } from "../../../../lib/db";
import Enrollment from "../../../../models/Enrollment";
import Service from "../../../../models/Service";
import Payment from "../../../../models/Payment";
import Period from "../../../../models/Periods";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json({ error: "توکن احراز هویت یافت نشد" }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return Response.json({ error: "توکن نامعتبر است" }, { status: 401 });
    }
    const enrollments = await Enrollment.find({ user: decoded.id })
      .populate({ path: 'service', select: 'title category level poster instructor instructorImage sessionsCount price priceAfterDiscount' })
      .sort({ enrolledAt: -1 })
      .lean();

    if (enrollments.length > 0) {
      const serviceIds = [...new Set(enrollments.map(e => e.service?._id).filter(Boolean))];

      const [latestPeriods, payments] = await Promise.all([
        Period.aggregate([
          { $match: { service: { $in: serviceIds } } },
          { $sort: { _id: -1 } },
          { $group: { _id: "$service", periodId: { $first: "$_id" } } },
        ]),
        Payment.find({ user: decoded.id, service: { $in: serviceIds } })
          .select("service forPeriodId status")
          .lean(),
      ]);

      const periodMap = new Map(latestPeriods.map(p => [p._id.toString(), p.periodId.toString()]));
      const paymentMap = new Map();
      for (const pay of payments) {
        const key = pay.service.toString();
        if (!paymentMap.has(key)) paymentMap.set(key, pay);
      }

      for (const enrollment of enrollments) {
        const serviceId = enrollment.service?._id?.toString();
        if (!serviceId) { enrollment.paymentStatus = 'pending'; continue; }
        const payment = paymentMap.get(serviceId);
        const latestPeriodId = periodMap.get(serviceId);
        if (payment && latestPeriodId) {
          enrollment.paymentStatus = (payment.forPeriodId?.toString() === latestPeriodId && payment.status === "paid") ? 'paid' : 'pending';
        } else {
          enrollment.paymentStatus = 'pending';
        }
      }
    }
    return Response.json({ enrollments });
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    return Response.json({ error: "خطا در دریافت ثبت‌نامی‌ها" }, { status: 500 });
  }
}
