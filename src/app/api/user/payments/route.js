import { connectDB } from "../../../../lib/db";
import Payment from "../../../../models/Payment";
import Enrollment from "../../../../models/Enrollment";
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
    } catch (_error) {
      return Response.json({ error: "توکن نامعتبر است" }, { status: 401 });
    }

    const userId = decoded.id;

    const payments = await Payment.find({ user: userId })
      .populate({ path: 'service', select: 'title category level poster instructor' })
      .populate('enrollment')
      .sort({ createdAt: -1 })
      .lean();

    return Response.json({ payments });
  } catch (error) {
    console.error("Error fetching user payments:", error);
    return Response.json({ error: "خطا در دریافت پرداخت‌ها" }, { status: 500 });
  }
}
