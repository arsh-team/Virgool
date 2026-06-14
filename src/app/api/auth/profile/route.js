// app/api/auth/profile/route.js
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Subject from "../../../../models/Subject";
import Class from "../../../../models/Class";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";

export async function PUT(request) {
  try {
    await connectDB();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: "توکن احراز هویت یافت نشد" }), {
        status: 401,
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
      });
    }

    const updateData = await request.json();
    
    // اطلاعات پایه کاربر
    const basicInfo = {
      username: updateData.username,
      firstname: updateData.firstname,
      lastname: updateData.lastname,
      phone: updateData.phone,
      age: updateData.age ? parseInt(updateData.age) : undefined,
      nationalCode: updateData.nationalCode,
      cardNumber: updateData.cardNumber,
    };

    // اطلاعات دانش‌آموزی
    if (updateData.studentInfo) {
      basicInfo.studentInfo = {
        parentName: updateData.studentInfo.parentName,
        parentPhone: updateData.studentInfo.parentPhone,
        emergencyContact: updateData.studentInfo.emergencyContact,
        bloodType: updateData.studentInfo.bloodType,
        allergies: updateData.studentInfo.allergies || [],
        medicalNotes: updateData.studentInfo.medicalNotes,
        enrolledClass: updateData.studentInfo.enrolledClass
      };
    }

    // اطلاعات دبیری
    if (updateData.teacherInfo) {
      basicInfo.teacherInfo = {
        degree: updateData.teacherInfo.degree,
        fieldOfStudy: updateData.teacherInfo.fieldOfStudy,
        university: updateData.teacherInfo.university,
        yearsOfExperience: updateData.teacherInfo.yearsOfExperience,
        socials: {
          eitaa: updateData.teacherInfo.socials?.eitaa,
          bale: updateData.teacherInfo.socials?.bale,
          telegram: updateData.teacherInfo.socials?.telegram,
          whatsapp: updateData.teacherInfo.socials?.whatsapp,
          shad: updateData.teacherInfo.socials?.shad,
          rubika: updateData.teacherInfo.socials?.rubika,
          soroush: updateData.teacherInfo.socials?.soroush,
        },
        certifications: updateData.teacherInfo.certifications || [],
        subjects: updateData.teacherInfo.subjects || [],
        classes: updateData.teacherInfo.classes || []
      };
    }

    if (updateData.profile) {
      basicInfo.profile = {
        avatar: updateData.profile.avatar,
        address: updateData.profile.address,
        city: updateData.profile.city,
        nationalCode: updateData.profile.nationalCode
      };
    }

    if (basicInfo.cardNumber && !/^\d{16}$/.test(basicInfo.cardNumber)) {
      return new Response(JSON.stringify({ error: "شماره کارت باید 16 رقمی باشد." }), {
        status: 400,
      });
    }

    if (basicInfo.nationalCode && !/^\d{10}$/.test(basicInfo.nationalCode)) {
      return new Response(JSON.stringify({ error: "کد ملی باید 10 رقمی باشد." }), {
        status: 400,
      });
    }

    const user = await User.findByIdAndUpdate(
      decoded.id,
      { $set: basicInfo },
      { new: true, runValidators: true }
    )
    .select('-password')
    .populate('studentInfo.enrolledClass')
    .populate('teacherInfo.subjects')
    .populate('teacherInfo.classes');

    if (!user) {
      return new Response(JSON.stringify({ error: "کاربر یافت نشد" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return new Response(JSON.stringify({ error: "خطا در بروزرسانی پروفایل" }), {
      status: 500,
    });
  }
}