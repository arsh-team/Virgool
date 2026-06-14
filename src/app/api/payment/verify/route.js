// app/api/payment/verify/route.js
import { connectDB } from "../../../../lib/db";
import Payment from "../../../../models/Payment";
import Service from "../../../../models/Service";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";

const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
if (!ZARINPAL_MERCHANT_ID) {
  throw new Error("ZARINPAL_MERCHANT_ID is not configured");
}
const ZARINPAL_VERIFY_URL = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");
    
    console.log("📥 Payment verification callback:", { authority, status });
    
    if (status !== "OK") {
      // پرداخت ناموفق یا انصراف کاربر
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>خطا در پرداخت</title>
            <style>
              body { font-family: Tahoma, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #5a80fb 0%, #764ba2 100%); }
              .card { background: white; border-radius: 20px; padding: 40px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
              .error-icon { width: 80px; height: 80px; background: #fee2e2; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
              .error-icon svg { width: 40px; height: 40px; color: #ef4444; }
              h1 { color: #dc2626; margin-bottom: 10px; }
              p { color: #666; margin-bottom: 20px; }
              button { background: linear-gradient(135deg, #5a80fb 0%, #764ba2 100%); color: white; border: none; padding: 12px 30px; border-radius: 10px; font-size: 16px; cursor: pointer; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="error-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1>❌ پرداخت ناموفق</h1>
              <p>پرداخت با شکست مواجه شد یا توسط شما لغو گردید.</p>
              <button onclick="window.location.href='/new'">بازگشت به صفحه ثبت مدرسه</button>
            </div>
          </body>
        </html>
      `, { 
        status: 200,
        headers: { "Content-Type": "text/html" }
      });
    }
    
    if (!authority) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"><title>خطا</title></head>
          <body><h1>خطا</h1><p>اطلاعات پرداخت یافت نشد</p><button onclick="window.location.href='/new'">بازگشت</button></body>
        </html>
      `, { status: 200, headers: { "Content-Type": "text/html" } });
    }
    
    // پیدا کردن پرداخت در دیتابیس
    const payment = await Payment.findOne({ authority: authority });
    
    if (!payment) {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"><title>خطا</title></head>
          <body><h1>❌ خطا</h1><p>رکورد پرداخت یافت نشد</p><button onclick="window.location.href='/new'">بازگشت</button></body>
        </html>
      `, { status: 200, headers: { "Content-Type": "text/html" } });
    }
    
    if (payment.status === "paid") {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"><title>پرداخت قبلاً انجام شده</title></head>
          <body><h1>✅ قبلاً پرداخت شده</h1><p>این پرداخت قبلاً با موفقیت انجام شده است</p><button onclick="window.location.href='/panel'">ورود به پنل</button></body>
        </html>
      `, { status: 200, headers: { "Content-Type": "text/html" } });
    }
    
    // تأیید پرداخت با زرین‌پال - فرمت جدید
    const verifyData = {
      merchant_id: ZARINPAL_MERCHANT_ID,
      amount: payment.amount,
      authority: authority
    };
    
    console.log("📤 Verifying payment with Zarinpal:", verifyData);
    
    const verifyResponse = await fetch(ZARINPAL_VERIFY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(verifyData)
    });
    
    const verifyResult = await verifyResponse.json();
    console.log("📥 Zarinpal verify response:", verifyResult);
    
    // بررسی نتیجه - فرمت جدید
    if (verifyResult.data && verifyResult.data.code === 100) {
      const refId = verifyResult.data.ref_id;
      
      // به‌روزرسانی وضعیت پرداخت
      payment.status = "paid";
      payment.refId = refId;
      payment.cardPan = verifyResult.data.card_pan;
      payment.paymentDate = new Date();
      await payment.save();
      
      // ایجاد سرویس (مدرسه)
      let serviceId = null;
      if (payment.schoolData && Object.keys(payment.schoolData).length > 0) {
        const schoolData = payment.schoolData;
        
        const baseSlug = schoolData.name
          .trim()
          .replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "")
          .replace(/\s+/g, "-")
          .toLowerCase();
        let slug = baseSlug;
        let counter = 1;
        while (await Service.findOne({ slug })) {
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        const service = await Service.create({
          title: schoolData.name,
          slug,
          category: "آموزشی",
          serviceType: "غیرحضوری",
          description: schoolData.description || `مدرسه ${schoolData.name}`,
          poster: schoolData.logo || "https://via.placeholder.com/300x200?text=School+Logo",
          instructor: "مدیر مدرسه",
          sessionDuration: "نامحدود",
          price: payment.amount,
          discountPercentage: 0,
          features: [
            { title: "مدیریت کامل مدرسه", description: "سیستم مدیریت یکپارچه مدرسه" }
          ],
          whatYouLearn: [
            "مدیریت کلاس‌ها و دروس",
            "ثبت نمرات ماهانه دانش‌آموزان",
            "ایجاد آزمون‌های آنلاین"
          ],
          address: schoolData.address || "",
          onlineMethod: "پلتفرم اختصاصی مدرسه",
          sessionsCount: 12,
          level: "همه سطوح",
          subscriptionPlan: payment.planId,
          subscriptionAmount: payment.amount,
          subscriptionPeriod: "yearly",
          fromUserId: payment.user,
          creator: payment.user,
          status: "فعال",
          isActive: true
        });
        
        serviceId = service._id;
        payment.service = serviceId;
        await payment.save();
      }
      
      // نمایش صفحه موفقیت
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>پرداخت موفق</title>
            <style>
              body { font-family: Tahoma, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: linear-gradient(135deg, #5a80fb 0%, #764ba2 100%); }
              .card { background: white; border-radius: 20px; padding: 40px; text-align: center; max-width: 500px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); animation: fadeIn 0.5s ease; }
              .success-icon { width: 80px; height: 80px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
              .success-icon svg { width: 40px; height: 40px; color: #22c55e; }
              h1 { color: #22c55e; margin-bottom: 10px; }
              p { color: #666; margin-bottom: 5px; }
              .ref-id { background: #f3f4f6; padding: 10px; border-radius: 10px; margin: 20px 0; font-family: monospace; font-size: 14px; }
              button { background: linear-gradient(135deg, #5a80fb 0%, #764ba2 100%); color: white; border: none; padding: 12px 30px; border-radius: 10px; font-size: 16px; cursor: pointer; margin-top: 20px; }
              @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="success-icon">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1>✅ پرداخت موفق</h1>
              <p>پرداخت اشتراک با موفقیت انجام شد.</p>
              <div class="ref-id">
                شماره پیگیری: ${refId}
              </div>
              <p>مدرسه شما با موفقیت ثبت شد.</p>
              <button onclick="window.location.href='/panel'">ورود به پنل مدیریت</button>
            </div>
          </body>
        </html>
      `, { status: 200, headers: { "Content-Type": "text/html" } });
      
    } else {
      // پرداخت ناموفق
      payment.status = "failed";
      await payment.save();
      
      const errorCode = verifyResult.data?.code;
      let errorMessage = "پرداخت ناموفق بود";
      
      if (errorCode === 101) {
        errorMessage = "این فاکتور قبلاً تسویه شده است";
      }
      
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head><meta charset="UTF-8"><title>خطا در پرداخت</title></head>
          <body><h1>❌ خطا در پرداخت</h1><p>${errorMessage}</p><button onclick="window.location.href='/new'">بازگشت</button></body>
        </html>
      `, { status: 200, headers: { "Content-Type": "text/html" } });
    }
    
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"><title>خطا در سیستم</title></head>
        <body><h1>❌ خطا در سیستم</h1><p>خطایی در پردازش پرداخت رخ داده است. لطفاً با پشتیبانی تماس بگیرید.</p><button onclick="window.location.href='/new'">بازگشت</button></body>
      </html>
    `, { status: 200, headers: { "Content-Type": "text/html" } });
  }
}