// app/api/admin/students/route.js
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Enrollment from "../../../../models/Enrollment";
import Service from "../../../../models/Service";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";

export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = decoded.id;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit")) || 50, 200);
    const skip = parseInt(searchParams.get("skip")) || 0;
    const search = searchParams.get("search") || "";

    const currentUser = await User.findById(userId);
    if (!currentUser || currentUser.type !== "creator") {
      return new Response(
        JSON.stringify({
          error:
            "دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند به این صفحه دسترسی داشته باشند",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let userQuery = {};
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      userQuery = {
        $or: [
          { firstname: { $regex: escapedSearch, $options: "i" } },
          { lastname: { $regex: escapedSearch, $options: "i" } },
          { email: { $regex: escapedSearch, $options: "i" } },
          { phone: { $regex: escapedSearch, $options: "i" } },
        ],
      };
    }

    const users = await User.find(userQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    // 🔥 بهینه‌سازی و رفع باگ DoS: دریافت تمام ثبت‌نام‌ها با یک کوئری به جای N کوئری همزمان
    const userIds = users.map((user) => user._id);
    const allEnrollments = await Enrollment.find({ user: { $in: userIds } })
      .populate({
        path: "service",
        select:
          "title category poster price priceAfterDiscount discountPercentage",
      })
      .sort({ lastAccessed: -1 });

    // گروه‌بندی ثبت‌نام‌ها بر اساس شناسه کاربر در حافظه
    const enrollmentsMap = allEnrollments.reduce((acc, enrollment) => {
      const uId = enrollment.user.toString();
      if (!acc[uId]) acc[uId] = [];
      acc[uId].push(enrollment);
      return acc;
    }, {});

    const studentsWithEnrollments = users.map((user) => {
      const userEnrollments = enrollmentsMap[user._id.toString()] || [];
      return {
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        type: user.type,
        createdAt: user.createdAt,
        enrollments: userEnrollments.map((enrollment) => ({
          _id: enrollment._id,
          service: enrollment.service,
          enrolledAt: enrollment.enrolledAt,
          amount: enrollment.amount,
          paymentStatus: enrollment.paymentStatus,
          progress: enrollment.progress,
          completed: enrollment.completed,
          lastAccessed: enrollment.lastAccessed,
          notes: enrollment.notes,
        })),
      };
    });

    const total = await User.countDocuments(userQuery);
    console.log(
      `✅ تعداد دانش‌آموزان یافت شده: ${studentsWithEnrollments.length} از ${total}`,
    );

    return new Response(
      JSON.stringify({
        students: studentsWithEnrollments,
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error fetching all students:", error);
    return new Response(
      JSON.stringify({
        error: "خطا در دریافت اطلاعات دانش‌آموزان",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || currentUser.type !== "creator") {
      return new Response(
        JSON.stringify({
          error:
            "دسترسی غیرمجاز. فقط ادمین‌ها می‌توانند این عملیات را انجام دهند",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    const { studentId, currentEnrollmentId, newServiceId } =
      await request.json();

    if (!studentId || !newServiceId) {
      return new Response(
        JSON.stringify({ error: "شناسه دانش‌آموز و خدمت جدید الزامی است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // 🔥 رفع باگ امنیتی NoSQL Injection: اعتبارسنجی ساختار شناسه برای جلوگیری از نوع داده مخرب (Type Confusion)
    if (
      !mongoose.Types.ObjectId.isValid(studentId) ||
      !mongoose.Types.ObjectId.isValid(newServiceId)
    ) {
      return new Response(
        JSON.stringify({ error: "فرمت شناسه دانش‌آموز یا خدمت نامعتبر است" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const student = await User.findById(studentId);
    if (!student) {
      return new Response(JSON.stringify({ error: "دانش‌آموز یافت نشد" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const newService = await Service.findById(newServiceId);
    if (!newService) {
      return new Response(JSON.stringify({ error: "خدمت جدید یافت نشد" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const existingEnrollment = await Enrollment.findOne({
      user: studentId,
      service: newServiceId,
    });
    if (existingEnrollment) {
      return new Response(
        JSON.stringify({
          error: "این دانش‌آموز قبلاً در این خدمت ثبت‌نام کرده است",
          enrollmentId: existingEnrollment._id,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
    if (
      currentEnrollmentId &&
      mongoose.Types.ObjectId.isValid(currentEnrollmentId)
    ) {
      const currentEnrollment = await Enrollment.findById(currentEnrollmentId);
      if (currentEnrollment) {
        if (currentEnrollment.user.toString() === studentId.toString()) {
          currentEnrollment.status = "transferred";
          currentEnrollment.transferredAt = new Date();
          await currentEnrollment.save();
          console.log(`✅ ثبت‌نام قبلی غیرفعال شد: ${currentEnrollmentId}`);
        }
      }
    }
    const newEnrollment = new Enrollment({
      user: studentId,
      service: newServiceId,
      amount: newService.priceAfterDiscount || newService.price,
      paymentStatus: "pending",
      progress: 0,
      completed: false,
      enrolledAt: new Date(),
      lastAccessed: new Date(),
      notes: `انتقال از خدمت دیگر - ${new Date().toLocaleDateString("fa-IR")}`,
    });
    await newEnrollment.save();
    console.log(
      `✅ ثبت‌نام جدید ایجاد شد برای دانش‌آموز ${studentId} در خدمت ${newServiceId}`,
    );
    return new Response(
      JSON.stringify({
        success: true,
        message: "خدمت دانش‌آموز با موفقیت تغییر کرد",
        enrollment: {
          _id: newEnrollment._id,
          service: newService.title,
          amount: newEnrollment.amount,
          enrolledAt: newEnrollment.enrolledAt,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Error changing student service:", error);
    return new Response(
      JSON.stringify({
        error: "خطا در تغییر خدمت دانش‌آموز",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
