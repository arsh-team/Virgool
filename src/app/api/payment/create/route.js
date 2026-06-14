// app/api/payment/create/route.js 
import { connectDB } from "../../../../lib/db";
import Payment from "../../../../models/Payment";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
if (!ZARINPAL_MERCHANT_ID) {
  throw new Error("ZARINPAL_MERCHANT_ID is not configured");
}

const ZARINPAL_REQUEST_URL = "https://sandbox.zarinpal.com/pg/v4/payment/request.json";
const ZARINPAL_START_PAY_URL = "https://sandbox.zarinpal.com/pg/StartPay/";

async function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return { userId: decoded.id };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const body = await request.json();
    const { amount, planId, planName, description, callbackUrl, schoolData, email, mobile } = body;
    
    if (!amount || amount <= 0) {
      return Response.json({ error: "مبلغ نامعتبر است" }, { status: 400 });
    }
    
    if (!planId) {
      return Response.json({ error: "شناسه پلن الزامی است" }, { status: 400 });
    }
    
    // آدرس بازگشت از پرداخت
    const finalCallbackUrl = callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/payment/verify`;
    
    // ایجاد درخواست به زرین‌پال - فرمت جدید
    const requestData = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: amount,
      callback_url: finalCallbackUrl,
      description: description || `پرداخت اشتراک ${planName || planId}`,
      metadata: {
        email: email || "",
        mobile: mobile || "",
        plan_id: planId,
        plan_name: planName
      }
    };
    
    console.log("📤 Sending payment request to Zarinpal:", JSON.stringify(requestData, null, 2));
    
    const zarinpalResponse = await fetch(ZARINPAL_REQUEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(requestData)
    });
    
    const result = await zarinpalResponse.json();
    console.log("📥 Zarinpal response:", result);
    
    // بررسی کد خطا بر اساس فرمت جدید
    if (result.data && result.data.code === 100) {
      const authority = result.data.authority;
      
      // ذخیره اطلاعات پرداخت در دیتابیس
      const payment = new Payment({
        user: auth.userId,
        amount: amount,
        planId: planId,
        planName: planName,
        description: description,
        authority: authority,
        status: "pending",
        callbackUrl: finalCallbackUrl,
        schoolData: schoolData || {}
      });
      
      await payment.save();
      
      // برگرداندن لینک پرداخت
      const paymentUrl = `${ZARINPAL_START_PAY_URL}${authority}`;
      
      return Response.json({
        success: true,
        authority: authority,
        paymentUrl: paymentUrl,
        paymentId: payment._id
      }, { status: 200 });
      
    } else {
      // خطاهای احتمالی
      const errorCode = result.data?.code || result.errors?.code;
      let errorMessage = "خطا در اتصال به درگاه پرداخت";
      
      switch (errorCode) {
        case -1:
          errorMessage = "اطلاعات ارسال شده ناقص است";
          break;
        case -2:
          errorMessage = "مرچنت کد نامعتبر است";
          break;
        case -3:
          errorMessage = "خطا در پرداخت";
          break;
        case -4:
          errorMessage = "سطح تایید مرچنت پایین است";
          break;
        case -11:
          errorMessage = "درخواست نامعتبر است";
          break;
        default:
          errorMessage = result.errors?.message || `خطا در درگاه پرداخت: کد خطا ${errorCode}`;
      }
      
      return Response.json({ error: errorMessage }, { status: 400 });
    }
    
  } catch (error) {
    console.error("❌ Payment creation error:", error);
    return Response.json({ error: "خطا در ایجاد درخواست پرداخت" }, { status: 500 });
  }
}