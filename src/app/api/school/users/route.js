import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Class from "../../../../models/Class";
import Subject from "../../../../models/Subject";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET is not configured");

async function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, SECRET);
    return { userId: decoded.id };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const requestingUser = await User.findById(auth.userId);
    if (!requestingUser) {
      return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const role = searchParams.get("role");
    const classId = searchParams.get("classId");

    if (!role || !["teacher", "student"].includes(role)) {
      return Response.json(
        { error: "مشخص کردن نقش (role) معتبر الزامی است" },
        { status: 400 },
      );
    }
    if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
      return Response.json(
        { error: "شناسه مدرسه معتبر الزامی است" },
        { status: 400 },
      );
    }

    if (
      requestingUser.type !== "creator" &&
      requestingUser.school?.toString() !== schoolId
    ) {
      return Response.json(
        { error: "شما دسترسی به اطلاعات این مدرسه را ندارید" },
        { status: 403 },
      );
    }

    let query = {};
    let schoolClassIds = [];
    let schoolTeacherIds = [];

    const schoolClasses = await Class.find({ school: schoolId }).select(
      "_id teacher assistantTeacher",
    ).lean();
    schoolClassIds = schoolClasses.map((cls) => cls._id);
    schoolTeacherIds = schoolClasses
      .flatMap((cls) => [cls.teacher, cls.assistantTeacher])
      .filter(Boolean)
      .map((id) => id.toString());

    const schoolSubjects = await Subject.find({ school: schoolId }).select(
      "teacher",
    ).lean();
    schoolTeacherIds.push(
      ...schoolSubjects
        .map((subject) => subject.teacher)
        .filter(Boolean)
        .map((id) => id.toString()),
    );
    schoolTeacherIds = [...new Set(schoolTeacherIds)];

    if (role === "teacher") {
      query = {
        schoolRole: "teacher",
        $or: [
          { school: new mongoose.Types.ObjectId(schoolId) },
          {
            _id: {
              $in: schoolTeacherIds.map(
                (id) => new mongoose.Types.ObjectId(id),
              ),
            },
          },
          { "teacherInfo.classes": { $in: schoolClassIds } },
        ],
      };
    } else if (role === "student") {
      query = { schoolRole: "student" };
      if (classId && mongoose.Types.ObjectId.isValid(classId)) {
        query["studentInfo.enrolledClass"] = new mongoose.Types.ObjectId(
          classId,
        );
      } else {
        query.$or = [
          { school: new mongoose.Types.ObjectId(schoolId) },
          { "studentInfo.enrolledClass": { $in: schoolClassIds } },
        ];
      }
    }

    const users = await User.find(query)
      .select("-password -providerInfo.bankInfo")
      .populate("studentInfo.enrolledClass", "name grade")
      .lean();

    return Response.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "خطا در دریافت کاربران" }, { status: 500 });
  }
}

// ساخت شیء studentInfo از فیلدهای تخت فرم
function buildStudentInfo(body) {
  const studentInfo = {};
  if (body.parentName !== undefined) studentInfo.parentName = body.parentName;
  if (body.parentPhone !== undefined) studentInfo.parentPhone = body.parentPhone;
  if (body.emergencyContact !== undefined) studentInfo.emergencyContact = body.emergencyContact;
  if (body.bloodType !== undefined) studentInfo.bloodType = body.bloodType;
  if (body.allergies !== undefined) studentInfo.allergies = body.allergies;
  if (body.medicalNotes !== undefined) studentInfo.medicalNotes = body.medicalNotes;
  if (body.enrolledClassId) studentInfo.enrolledClass = body.enrolledClassId;
  if (body.studentInfo) {
    Object.assign(studentInfo, body.studentInfo);
  }
  return studentInfo;
}

// ساخت شیء teacherInfo از فیلدهای تخت فرم
function buildTeacherInfo(body) {
  const teacherInfo = {};
  if (body.expertise !== undefined) teacherInfo.expertise = body.expertise;
  if (body.yearsOfExperience !== undefined) teacherInfo.yearsOfExperience = body.yearsOfExperience;
  if (body.degree !== undefined) teacherInfo.degree = body.degree;
  if (body.teacherInfo) {
    Object.assign(teacherInfo, body.teacherInfo);
  }
  return teacherInfo;
}

export async function POST(request) {
  try {
    await connectDB();

    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const requestingUser = await User.findById(auth.userId);
    if (
      !requestingUser ||
      requestingUser.type !== "creator"
    ) {
      return Response.json(
        { error: "شما دسترسی به این عملیات ندارید" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const {
      schoolId,
      role,
      firstname,
      lastname,
      email,
      phone,
      password,
      nationalCode,
      address,
    } = body;

    if (!schoolId || !mongoose.Types.ObjectId.isValid(schoolId)) {
      return Response.json(
        { error: "شناسه مدرسه نامعتبر یا الزامی است" },
        { status: 400 },
      );
    }

    if (
      requestingUser.type !== "creator" &&
      requestingUser.school?.toString() !== schoolId
    ) {
      return Response.json(
        { error: "شما مجاز به ثبت کاربر در این مدرسه نیستید" },
        { status: 403 },
      );
    }

    if (!role || !["student", "teacher"].includes(role)) {
      return Response.json(
        { error: "نقش کاربر (student یا teacher) الزامی است" },
        { status: 400 },
      );
    }
    if (!email) {
      return Response.json({ error: "ایمیل الزامی است" }, { status: 400 });
    }
    // نرمال‌سازی ایمیل
    const normalizedEmail = email.trim().toLowerCase();
    if (!firstname || !lastname) {
      return Response.json(
        { error: "نام و نام خانوادگی الزامی است" },
        { status: 400 },
      );
    }

    const resourceType = role === "teacher" ? "teachers" : "students";
    const { checkSubscriptionLimit } =
      await import("../../../../lib/subscription-check");
    const limitCheck = await checkSubscriptionLimit(
      auth.userId,
      resourceType,
      schoolId,
    );

    if (!limitCheck.success) {
      return Response.json(
        { error: limitCheck.error },
        { status: limitCheck.status || 400 },
      );
    }

    // بررسی کدملی تکراری
    if (nationalCode) {
      const existingNationalCode = await User.findOne({ nationalCode });
      if (existingNationalCode) {
        return Response.json(
          { error: "کدملی وارد شده قبلاً ثبت شده است" },
          { status: 400 },
        );
      }
    }

    // ساخت studentInfo و teacherInfo از فیلدهای تخت فرم
    const studentInfo = buildStudentInfo(body);
    const teacherInfo = buildTeacherInfo(body);

    if (studentInfo.enrolledClass) {
      if (!mongoose.Types.ObjectId.isValid(studentInfo.enrolledClass)) {
        return Response.json(
          { error: "شناسه کلاس نامعتبر است" },
          { status: 400 },
        );
      }
      studentInfo.enrolledClass = new mongoose.Types.ObjectId(
        studentInfo.enrolledClass,
      );
    }

    let user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (user) {
      user.schoolRole = role;
      user.school = new mongoose.Types.ObjectId(schoolId);

      if (nationalCode !== undefined) user.nationalCode = nationalCode;
      if (address !== undefined) {
        user.profile = user.profile || {};
        user.profile.address = address;
      }

      if (role === "teacher" && Object.keys(teacherInfo).length > 0) {
        user.teacherInfo = { ...user.teacherInfo?.toObject?.() || {}, ...teacherInfo };
      } else if (role === "student" && Object.keys(studentInfo).length > 0) {
        const previousClass = user.studentInfo?.enrolledClass?.toString();
        user.studentInfo = { ...user.studentInfo?.toObject?.() || {}, ...studentInfo };

        if (studentInfo.enrolledClass) {
          if (
            previousClass &&
            previousClass !== studentInfo.enrolledClass.toString()
          ) {
            await Class.findByIdAndUpdate(previousClass, {
              $pull: { students: user._id },
            });
          }
          await Class.findByIdAndUpdate(studentInfo.enrolledClass, {
            $addToSet: { students: user._id },
          });
        }
      }
      if (phone) user.phone = phone;
      // عبور از مشکل select:false برای رمز عبور - رمز عبور قبلی حفظ می‌شود
      // اگر رمز عبور جدیدی مشخص نشده، رمز قبلی بدون تغییر باقی می‌ماند
      if (password) user.password = password;
      await user.save();
    } else {
      user = new User({
        email: normalizedEmail,
        firstname,
        lastname,
        phone: phone || "",
        nationalCode: nationalCode || undefined,
        password: password || crypto.randomBytes(8).toString("hex"),
        schoolRole: role,
        type: "user",
        school: new mongoose.Types.ObjectId(schoolId),
        profile: address ? { address } : undefined,
      });

      if (role === "teacher" && Object.keys(teacherInfo).length > 0) {
        user.teacherInfo = teacherInfo;
      } else if (role === "student" && Object.keys(studentInfo).length > 0) {
        user.studentInfo = studentInfo;
        if (studentInfo.enrolledClass) {
          await Class.findByIdAndUpdate(studentInfo.enrolledClass, {
            $addToSet: { students: user._id },
          });
        }
      }
      await user.save();
    }

    await user.populate("studentInfo.enrolledClass", "name grade");
    const userResponse = user.toObject();
    delete userResponse.password;

    return Response.json(
      {
        message: `کاربر با موفقیت ایجاد شد. رمز عبور موقت از طریق پیامک ارسال خواهد شد.`,
        user: userResponse,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === "nationalCode") {
        return Response.json({ error: "کدملی وارد شده قبلاً ثبت شده است" }, { status: 400 });
      }
      if (field === "email") {
        return Response.json({ error: "ایمیل وارد شده قبلاً ثبت شده است" }, { status: 400 });
      }
      return Response.json({ error: "اطلاعات وارد شده تکراری است" }, { status: 400 });
    }
    // نمایش خطای اعتبارسنجی Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return Response.json({ error: messages.join(' | ') }, { status: 400 });
    }
    return Response.json({ error: `خطا در ثبت کاربر: ${error.message || 'خطای ناشناخته'}` }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const requestingUser = await User.findById(auth.userId);
    if (
      !requestingUser ||
      requestingUser.type !== "creator"
    ) {
      return Response.json(
        { error: "شما دسترسی به این عملیات ندارید" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return Response.json(
        { error: "شناسه کاربر ارسالی نامعتبر یا الزامی است" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    if (
      requestingUser.type !== "creator" &&
      requestingUser.school?.toString() !== user.school?.toString()
    ) {
      return Response.json(
        { error: "شما مجاز به ویرایش کاربران مدارس دیگر نیستید" },
        { status: 403 },
      );
    }

    const body = await request.json();

    if (body.firstname) user.firstname = body.firstname;
    if (body.lastname) user.lastname = body.lastname;
    if (body.phone) user.phone = body.phone;

    if (body.password) {
      // TODO: Current password verification should be required before allowing password change.
      // Currently any admin can change any user's password without verifying the current password.
      // This should be enhanced to require currentPassword for non-admin users.
      user.password = body.password; // TODO: Password should be hashed before saving. Currently stored in plaintext.
    }
    if (body.schoolId && mongoose.Types.ObjectId.isValid(body.schoolId)) {
      user.school = new mongoose.Types.ObjectId(body.schoolId);
    }

    // ذخیره nationalCode
    if (body.nationalCode !== undefined) {
      // بررسی کدملی تکراری (غیر از خود کاربر)
      if (body.nationalCode) {
        const existingNationalCode = await User.findOne({
          nationalCode: body.nationalCode,
          _id: { $ne: userId },
        });
        if (existingNationalCode) {
          return Response.json(
            { error: "کدملی وارد شده قبلاً ثبت شده است" },
            { status: 400 },
          );
        }
      }
      user.nationalCode = body.nationalCode;
    }

    // ذخیره address
    if (body.address !== undefined) {
      user.profile = user.profile || {};
      user.profile.address = body.address;
    }

    // ساخت studentInfo و teacherInfo از فیلدهای تخت فرم
    const studentInfo = buildStudentInfo(body);
    const teacherInfo = buildTeacherInfo(body);

    if (Object.keys(teacherInfo).length > 0) {
      user.teacherInfo = { ...user.teacherInfo?.toObject?.() || {}, ...teacherInfo };
    }
    if (Object.keys(studentInfo).length > 0) {
      const previousClass = user.studentInfo?.enrolledClass?.toString();
      if (studentInfo.enrolledClass) {
        if (!mongoose.Types.ObjectId.isValid(studentInfo.enrolledClass)) {
          return Response.json(
            { error: "شناسه کلاس نامعتبر است" },
            { status: 400 },
          );
        }
        studentInfo.enrolledClass = new mongoose.Types.ObjectId(
          studentInfo.enrolledClass,
        );
      }
      user.studentInfo = { ...user.studentInfo?.toObject?.() || {}, ...studentInfo };
      if (studentInfo.enrolledClass) {
        if (
          previousClass &&
          previousClass !== studentInfo.enrolledClass.toString()
        ) {
          await Class.findByIdAndUpdate(previousClass, {
            $pull: { students: user._id },
          });
        }
        await Class.findByIdAndUpdate(studentInfo.enrolledClass, {
          $addToSet: { students: user._id },
        });
      }
    }

    await user.save();
    const userResponse = user.toObject();
    delete userResponse.password;

    return Response.json({
      message: "کاربر با موفقیت بروزرسانی شد",
      user: userResponse,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      if (field === "nationalCode") {
        return Response.json({ error: "کدملی وارد شده قبلاً ثبت شده است" }, { status: 400 });
      }
      if (field === "email") {
        return Response.json({ error: "ایمیل وارد شده قبلاً ثبت شده است" }, { status: 400 });
      }
      return Response.json({ error: "اطلاعات وارد شده تکراری است" }, { status: 400 });
    }
    return Response.json({ error: "خطا در بروزرسانی کاربر" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const requestingUser = await User.findById(auth.userId);
    if (
      !requestingUser ||
      requestingUser.type !== "creator"
    ) {
      return Response.json(
        { error: "شما دسترسی به این عملیات ندارید" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return Response.json(
        { error: "شناسه کاربر ارسالی نامعتبر یا الزامی است" },
        { status: 400 },
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }

    if (
      requestingUser.type !== "creator" &&
      requestingUser.school?.toString() !== user.school?.toString()
    ) {
      return Response.json(
        { error: "شما مجاز به حذف کاربران مدارس دیگر نیستید" },
        { status: 403 },
      );
    }

    if (user.schoolRole === "student" && user.studentInfo?.enrolledClass) {
      await Class.findByIdAndUpdate(user.studentInfo.enrolledClass, {
        $pull: { students: userId },
      });
    }

    await User.findByIdAndDelete(userId);
    return Response.json({ message: "کاربر با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return Response.json({ error: "خطا در حذف کاربر" }, { status: 500 });
  }
}
