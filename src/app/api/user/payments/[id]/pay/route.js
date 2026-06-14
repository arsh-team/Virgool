import { connectDB } from "../../../../../../lib/db";
import Payment from "../../../../../../models/Payment";
import Wallet from "../../../../../../models/Wallet";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../../lib/auth";
export async function POST(request, { params }) {
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
    } catch (error) {
      return Response.json(
        { error: "توکن نامعتبر است" }, 
        { status: 401 }
      );
    }
    const { id } = params;
    const payment = await Payment.findOne({
      _id: id,
      user: decoded.id
    });
    if (!payment) {
      return Response.json(
        { error: "پرداخت یافت نشد یا دسترسی ندارید" }, 
        { status: 404 }
      );
    }
    if (payment.status === 'paid') {
      return Response.json(
        { error: "این پرداخت قبلاً انجام شده است" }, 
        { status: 400 }
      );
    }
    const wallet = await Wallet.findOne({ user: decoded.id });
    if (!wallet) {
      return Response.json(
        { error: "کیف پول شما یافت نشد" }, 
        { status: 404 }
      );
    }
    const updatedWallet = await Wallet.findOneAndUpdate(
      { user: decoded.id, balance: { $gte: payment.amount } },
      { 
        $inc: { balance: -payment.amount },
        $push: { transactions: { type: 'expense', amount: payment.amount, description: `پرداخت ${payment.planName || 'فاکتور'}`, status: 'completed', createdAt: new Date() } }
      },
      { new: true }
    );
    if (!updatedWallet) {
      return Response.json(
        { error: "موجودی کیف پول شما کافی نیست" }, 
        { status: 400 }
      );
    }
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();
    if (payment.enrollment) {
      const Enrollment = require("../../../../../../models/Enrollment");
      await Enrollment.findByIdAndUpdate(payment.enrollment, {
        paymentStatus: 'paid'
      });
    }
    return Response.json({ 
      message: "پرداخت با موفقیت انجام شد",
      payment 
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    return Response.json(
      { error: "خطا در پردازش پرداخت" }, 
      { status: 500 }
    );
  }
}