// app/api/school/payment-receipts/route.js - اصلاح متد GET

import { connectDB } from "../../../../lib/db";
import PaymentReceipt from "../../../../models/PaymentReceipt";
import StudentPayment from "../../../../models/StudentPayment";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
import mongoose from "mongoose";

// Helper function to calculate the current Iranian academic year dynamically
function getCurrentAcademicYear() {
  const now = new Date();
  const currentYear = now.getFullYear();
  // Iranian academic year typically starts in September (Shahrivar/Mehr)
  // If we're before September, we're in the second half of the previous academic year
  const isBeforeAcademicYear = now.getMonth() < 8; // Before September (0-indexed)
  // Approximate Jalali year from Gregorian
  const jalaliYear = isBeforeAcademicYear ? currentYear - 622 : currentYear - 621;
  return `${jalaliYear}-${jalaliYear + 1}`;
}

async function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id);
    if (!user) {
      return { error: "کاربر یافت نشد", status: 401 };
    }
    return { userId: decoded.id, user };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

// GET /api/school/payment-receipts?schoolId=...&studentId=...&receiptId=...
export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const studentId = searchParams.get("studentId");
    const receiptId = searchParams.get("receiptId");
    const receiptNumber = searchParams.get("receiptNumber");
    
    let query = {};
    
    if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
      query.school = schoolId;
    }
    
    // اگر کاربر دانش‌آموز است، فقط رسیدهای خودش را نشان بده
    if (auth.user.type !== 'creator' && auth.user.schoolRole === 'student') {
      query.student = auth.user._id;
    } else if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      query.student = studentId;
    }
    
    if (receiptId && mongoose.Types.ObjectId.isValid(receiptId)) {
      query._id = receiptId;
    }
    
    if (receiptNumber) {
      query.receiptNumber = receiptNumber;
    }
    
    console.log("Payment receipts query:", JSON.stringify(query));
    
    const receipts = await PaymentReceipt.find(query)
      .populate("student", "firstname lastname email phone")
      .populate("class", "name grade")
      .populate("recordedBy", "firstname lastname")
      .sort({ paymentDate: -1 })
      .lean();
    
    // اگر کاربر دانش‌آموز است و رسیدی برای او نیست، آرایه خالی برگردان
    if (auth.user.type !== 'creator' && auth.user.schoolRole === 'student') {
      const userReceipts = receipts.filter(r => r.student?._id.toString() === auth.user._id.toString());
      return Response.json({ receipts: userReceipts });
    }
    
    return Response.json({ receipts });
  } catch (error) {
    console.error("Error fetching receipts:", error);
    return Response.json({ error: "خطا در دریافت رسیدهای پرداخت" }, { status: 500 });
  }
}

// POST - فقط برای مدیران (بدون تغییر)
export async function POST(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    // فقط مدیران می‌توانند پرداخت ثبت کنند
    if (auth.user.type !== 'creator') {
      return Response.json({ error: "دسترسی غیرمجاز. فقط مدیران می‌توانند پرداخت ثبت کنند." }, { status: 403 });
    }
    
    const formData = await request.formData();
    
    const studentId = formData.get("studentId");
    const studentName = formData.get("studentName");
    const classId = formData.get("classId");
    const className = formData.get("className");
    const schoolId = formData.get("schoolId");
    const schoolName = formData.get("schoolName");
    const studentPaymentId = formData.get("studentPaymentId");
    const amount = parseFloat(formData.get("amount"));
    const paymentMethod = formData.get("paymentMethod");
    const paymentMethodDetails = formData.get("paymentMethodDetails") || "";
    const paymentDate = formData.get("paymentDate") || new Date().toISOString();
    const description = formData.get("description") || "";
    const receiptImageFile = formData.get("receiptImage");
    
    if (!studentId || !studentPaymentId || !amount || amount <= 0) {
      return Response.json({ error: "اطلاعات پرداخت ناقص است" }, { status: 400 });
    }
    
    if (!paymentMethod) {
      return Response.json({ error: "روش پرداخت مشخص نشده است" }, { status: 400 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(studentPaymentId)) {
      return Response.json({ error: "شناسه پرداخت دانش‌آموز نامعتبر است" }, { status: 400 });
    }
    
    const studentPayment = await StudentPayment.findById(studentPaymentId);
    if (!studentPayment) {
      return Response.json({ error: "سوابق مالی دانش‌آموز یافت نشد" }, { status: 404 });
    }
    
    let remainingTotal = studentPayment.totalRemaining;
    if (amount > remainingTotal) {
      return Response.json({ 
        error: `مبلغ پرداختی (${amount.toLocaleString()} تومان) بیشتر از مبلغ باقی مانده (${remainingTotal.toLocaleString()} تومان) است`,
        remainingAmount: remainingTotal
      }, { status: 400 });
    }
    
    let remainingAmount = amount;
    const updatedPaymentItems = [...studentPayment.paymentItems];
    const paymentItemsRecord = [];
    
    for (let i = 0; i < updatedPaymentItems.length && remainingAmount > 0; i++) {
      const item = updatedPaymentItems[i];
      const itemRemaining = item.remainingAmount;
      
      if (itemRemaining > 0) {
        const paymentForItem = Math.min(remainingAmount, itemRemaining);
        const newPaidAmount = item.paidAmount + paymentForItem;
        
        paymentItemsRecord.push({
          feeItemId: item.feeItemId,
          feeItemName: item.feeItemName,
          amount: paymentForItem,
          previousPaid: item.paidAmount,
          newTotalPaid: newPaidAmount,
          remainingAfterPayment: item.remainingAmount - paymentForItem
        });
        
        item.paidAmount = newPaidAmount;
        item.remainingAmount = item.remainingAmount - paymentForItem;
        item.isFullyPaid = item.remainingAmount <= 0;
        
        remainingAmount -= paymentForItem;
      }
    }
    
    if (remainingAmount > 0) {
      return Response.json({ error: "خطا در تخصیص مبلغ به آیتم‌های شهریه" }, { status: 400 });
    }
    
    // TODO: IMPORTANT - The payment processing below (updating StudentPayment and creating PaymentReceipt)
    // is NOT atomic. These two operations should be wrapped in a database transaction to ensure data
    // consistency. If the receipt creation fails after the payment items are updated, the data will be
    // in an inconsistent state. Use MongoDB sessions/transactions to fix this:
    // const session = await mongoose.startSession();
    // session.startTransaction();
    // try { ... await session.commitTransaction(); } catch { await session.abortTransaction(); }
    studentPayment.paymentItems = updatedPaymentItems;
    await studentPayment.save();
    
    let receiptImageUrl = null;
    let receiptImagePublicId = null;
    
    const receiptImageUrlFromClient = formData.get("receiptImageUrl");
    
    if (receiptImageUrlFromClient) {
      receiptImageUrl = receiptImageUrlFromClient;
    } else if (receiptImageFile && receiptImageFile.size > 0 && receiptImageFile.size < 5 * 1024 * 1024) {
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(receiptImageFile.type)) {
        return Response.json({ error: "فرمت تصویر نامعتبر است. فقط JPEG، PNG، WebP و GIF مجاز هستند" }, { status: 400 });
      }
      const buffer = Buffer.from(await receiptImageFile.arrayBuffer());
      const base64 = buffer.toString('base64');
      const mimeType = receiptImageFile.type;
      receiptImageUrl = `data:${mimeType};base64,${base64}`;
    }
    
    const receipt = new PaymentReceipt({
      student: studentId,
      studentName: studentName,
      class: classId,
      className: className,
      school: schoolId,
      schoolName: schoolName,
      studentPaymentId: studentPaymentId,
      academicYear: formData.get("academicYear") || getCurrentAcademicYear(),
      amount: amount,
      paymentItems: paymentItemsRecord,
      paymentMethod: paymentMethod,
      paymentMethodDetails: paymentMethodDetails,
      paymentDate: new Date(paymentDate),
      receiptImage: receiptImageUrl,
      receiptImagePublicId: receiptImagePublicId,
      description: description,
      recordedBy: auth.userId,
      recordedByName: `${auth.user.firstname} ${auth.user.lastname}`,
      status: 'verified'
    });
    
    await receipt.save();
    console.log("Receipt created successfully:", receipt.receiptNumber);
    
    return Response.json({ 
      success: true,
      message: "پرداخت با موفقیت ثبت شد", 
      receipt,
      studentPayment: {
        id: studentPayment._id,
        totalPaid: studentPayment.totalPaid,
        totalRemaining: studentPayment.totalRemaining,
        paymentStatus: studentPayment.paymentStatus
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating payment receipt:", error);
    return Response.json({ 
      error: "خطا در ثبت پرداخت"
    }, { status: 500 });
  }
}