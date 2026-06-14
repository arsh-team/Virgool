// app/api/payment/withdrawal.js
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Payment from "../../../../models/Payment";
import Sub from "../../../../models/Sub";
import Service from "../../../../models/Service";
import { authenticateRequest } from "../../../../lib/auth";
import mongoose from "mongoose";

export async function POST(request) {
  try {
    await connectDB();

    // احراز هویت متمرکز
    const auth = await authenticateRequest(request);
    if (auth.error) {
      return new Response(
        JSON.stringify({ error: auth.error }),
        { status: auth.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const userId = auth.userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return new Response(
        JSON.stringify({ error: "شناسه کاربر نامعتبر است" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return new Response(
        JSON.stringify({ error: "کاربر یافت نشد" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // بررسی اینکه کاربر واقعاً سازنده باشد
    if (user.type !== 'creator') {
      return new Response(
        JSON.stringify({ error: "فقط سازندگان می‌توانند درخواست برداشت داشته باشند" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!user.cardNumber) {
      return new Response(
        JSON.stringify({ error: "شماره کارت کاربر پر نشده است" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // SECURITY FIX: فقط پرداخت‌های مربوط به سرویس‌های خود این کاربر
    // ابتدا شناسه سرویس‌های این کاربر را پیدا می‌کنیم
    const userServices = await Service.find({ creator: userId }).select("_id");
    const userServiceIds = userServices.map(s => s._id);

    if (userServiceIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "شما هیچ سرویس فعالی ندارید" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // فقط پرداخت‌های پرداخت‌نشده مربوط به سرویس‌های خود کاربر
    const pendingPayments = await Payment.find({
      paidToCreator: false,
      service: { $in: userServiceIds },
      status: "paid"
    });

    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    const withdrawableAmount = totalPendingAmount * 0.95;

    if (withdrawableAmount <= 0) {
      return new Response(
        JSON.stringify({ error: "مبلغی برای پرداخت وجود ندارد" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const sub = new Sub({
      user: userId,
      amount: withdrawableAmount,
      bankNumber: user.cardNumber
    });
    await sub.save();

    // SECURITY FIX: فقط پرداخت‌های مربوط به سرویس‌های این کاربر علامت‌گذاری شوند
    await Payment.updateMany(
      { paidToCreator: false, service: { $in: userServiceIds }, status: "paid" },
      { $set: { paidToCreator: true } }
    );

    return new Response(
      JSON.stringify({
        success: true,
        amount: withdrawableAmount,
        bankNumber: user.cardNumber
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("خطا در درخواست برداشت:", error);
    return new Response(
      JSON.stringify({ error: "خطا در درخواست برداشت" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}