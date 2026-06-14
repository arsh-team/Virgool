import { connectDB } from "../../../../../lib/db";
import Wallet from "../../../../../models/Wallet";
import { authenticateRequest } from "../../../../../lib/auth";
import { validateAmount, sanitizeInput } from "../../../../../lib/security";

export async function POST(request) {
  try {
    await connectDB();

    // احراز هویت
    const auth = await authenticateRequest(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const body = sanitizeInput(await request.json());
    const { amount } = body;

    // اعتبارسنجی مبلغ
    const amountValidation = validateAmount(amount);
    if (!amountValidation.valid) {
      return Response.json({ error: amountValidation.error }, { status: 400 });
    }

    // ⚠️ SECURITY NOTE: این اندپوینت دیگر موجودی کیف پول را مستقیماً افزایش نمی‌دهد.
    // برای افزایش موجودی واقعی، باید از درگاه پرداخت (زرین‌پال) استفاده شود.
    // این اندپوینت فقط یک درخواست واریز ثبت می‌کند و منتظر تأیید پرداخت می‌ماند.

    let wallet = await Wallet.findOne({ user: auth.userId });
    if (!wallet) {
      wallet = await Wallet.create({
        user: auth.userId,
        balance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
        transactions: []
      });
    }

    // مبلغ به pendingBalance اضافه می‌شود تا پس از تأیید پرداخت به balance منتقل شود
    wallet.pendingBalance += amount;
    wallet.transactions.push({
      type: 'income',
      amount: amount,
      description: 'درخواست افزایش موجودی - در انتظار پرداخت',
      status: 'pending',
      createdAt: new Date()
    });
    await wallet.save();

    return Response.json({
      message: "درخواست افزایش موجودی ثبت شد. لطفاً از درگاه پرداخت اقدام کنید.",
      wallet,
      requirePayment: true
    });
  } catch (error) {
    console.error("Error depositing to wallet:", error);
    return Response.json(
      { error: "خطا در افزایش موجودی" },
      { status: 500 }
    );
  }
}