import { connectDB } from "../../../../lib/db";
import Wallet from "../../../../models/Wallet";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
export async function GET(request) {
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
    let wallet = await Wallet.findOne({ user: decoded.id })
      .populate({
        path: 'transactions.service',
        select: 'title'
      })
      .lean();
    if (!wallet) {
      const newWallet = await Wallet.create({
        user: decoded.id,
        balance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        transactions: []
      });
      wallet = newWallet.toObject();
    }
    return Response.json({ wallet });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return Response.json(
      { error: "خطا در دریافت اطلاعات کیف پول" }, 
      { status: 500 }
    );
  }
}