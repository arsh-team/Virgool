import { connectDB } from "../../../../../lib/db";
import Enrollment from "../../../../../models/Enrollment";
import Payment from "../../../../../models/Payment";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";
export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: "توکن احراز هویت یافت نشد" }, 
        { status: 401 }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return Response.json(
        { error: "توکن نامعتبر است" }, 
        { status: 401 }
      );
    }
    const { id } = params;
    const enrollment = await Enrollment.findOne({
      _id: id,
      user: decoded.id
    });
    if (!enrollment) {
      return Response.json(
        { error: "ثبت‌نام یافت نشد یا دسترسی ندارید" }, 
        { status: 404 }
      );
    }
    const relatedPayments = await Payment.find({
      enrollment: id,
      user: decoded.id
    });
    const hasPaid = relatedPayments.some(p => p.status === 'paid');
    const now = new Date();
    const enrolledAt = new Date(enrollment.enrolledAt);
    const hoursSinceEnrollment = (now - enrolledAt) / (1000 * 60 * 60);
    if (hoursSinceEnrollment < 24 || hasPaid) {
      if (relatedPayments.length > 0) {
        await Payment.deleteMany({ _id: { $in: relatedPayments.map(p => p._id) } });
      }
      await Enrollment.findByIdAndDelete(id);
      return Response.json({ 
        message: "با موفقیت از دوره خارج شدید",
        refunded: hasPaid 
      });
    }
    return Response.json(
      { 
        error: "برای خروج از دوره باید شهریه را پرداخت کرده باشید یا کمتر از 24 ساعت از ثبت‌نام شما گذشته باشد" 
      }, 
      { status: 400 }
    );
  } catch (error) {
    console.error("Error deleting enrollment:", error);
    return Response.json(
      { error: "خطا در حذف ثبت‌نام" }, 
      { status: 500 }
    );
  }
}