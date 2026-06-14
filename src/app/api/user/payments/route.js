import { connectDB } from "../../../../lib/db";
import Payment from "../../../../models/Payment";
import Enrollment from "../../../../models/Enrollment";
import Period from "../../../../models/Periods";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
import mongoose from "mongoose";

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
    } catch (_error) {
      return Response.json({ error: "توکن نامعتبر است" }, { status: 401 });
    }

    const userId = decoded.id;
    const enrollments = await Enrollment.find({ user: userId })
      .select("service amount")
      .lean();

    if (enrollments.length > 0) {
      const serviceIds = [...new Set(enrollments.map(e => e.service?.toString()).filter(Boolean))];

      const [allPeriods, existingPayments] = await Promise.all([
        Period.find({ service: { $in: serviceIds } })
          .select("service _id endDate")
          .sort({ service: 1, _id: -1 })
          .lean(),
        Payment.find({ user: userId, service: { $in: serviceIds } })
          .select("service forPeriodId status amount netAmount type dueDate")
          .lean(),
      ]);

      const periodsByService = new Map();
      for (const p of allPeriods) {
        const key = p.service.toString();
        if (!periodsByService.has(key)) periodsByService.set(key, []);
        periodsByService.get(key).push(p);
      }

      const existingKeySet = new Set(
        existingPayments.map(p => `${p.service.toString()}_${p.forPeriodId.toString()}`)
      );

      const paymentsToCreate = [];
      for (const enrollment of enrollments) {
        const serviceId = enrollment.service?.toString();
        if (!serviceId) continue;
        const periods = periodsByService.get(serviceId) || [];
        for (const period of periods) {
          const compositeKey = `${serviceId}_${period._id.toString()}`;
          if (!existingKeySet.has(compositeKey)) {
            paymentsToCreate.push({
              user: new mongoose.Types.ObjectId(userId),
              service: new mongoose.Types.ObjectId(serviceId),
              forPeriodId: period._id,
              amount: enrollment.amount,
              netAmount: enrollment.amount,
              type: 'full',
              status: 'pending',
              dueDate: period.endDate,
            });
          }
        }
      }

      if (paymentsToCreate.length > 0) {
        await Payment.insertMany(paymentsToCreate, { ordered: false }).catch(() => {});
      }
    }

    const payments = await Payment.find({ user: userId })
      .populate({ path: 'service', select: 'title category level poster instructor paymentSettings' })
      .populate('enrollment')
      .sort({ dueDate: 1 })
      .lean();

    return Response.json({ payments });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    return Response.json({ error: "خطا در دریافت پرداخت‌ها" }, { status: 500 });
  }
}
