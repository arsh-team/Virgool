// app/api/auth/profile/route.js
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
import { sanitizeInput, isValidObjectId } from "../../../../lib/security";

function validateNationalCode(code) {
  if (!/^\d{10}$/.test(code)) return false;
  const check = parseInt(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(code[i]) * (10 - i);
  let remainder = sum % 11;
  return (remainder < 2 && check === remainder) || (remainder >= 2 && check === 11 - remainder);
}

function validateCardNumber(card) {
  if (!/^\d{16}$/.test(card)) return false;
  // Luhn algorithm
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let digit = parseInt(card[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
}

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
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), {
        status: 401,
      });
    }

    const rawData = await request.json();
    const updateData = sanitizeInput(rawData);
    
    // اطلاعات پایه کاربر
    const basicInfo = {
      username: updateData.username,
      firstname: updateData.firstname,
      lastname: updateData.lastname,
      phone: updateData.phone,
      nationalCode: updateData.nationalCode,
      cardNumber: updateData.cardNumber,
    };

    if (updateData.age !== undefined) {
      const age = parseInt(updateData.age);
      if (isNaN(age) || age < 1 || age > 150) {
        return new Response(JSON.stringify({ error: "سن نامعتبر است" }), {
          status: 400,
        });
      }
      basicInfo.age = age;
    }

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

      // Validate enrolledClass ObjectId
      if (basicInfo.studentInfo.enrolledClass && !isValidObjectId(basicInfo.studentInfo.enrolledClass)) {
        return new Response(JSON.stringify({ error: "شناسه کلاس نامعتبر است" }), {
          status: 400,
        });
      }
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

      // Validate subject ObjectIds
      if (Array.isArray(basicInfo.teacherInfo.subjects)) {
        for (const subjectId of basicInfo.teacherInfo.subjects) {
          if (subjectId && !isValidObjectId(subjectId)) {
            return new Response(JSON.stringify({ error: "شناسه درس نامعتبر است" }), {
              status: 400,
            });
          }
        }
      }

      // Validate class ObjectIds
      if (Array.isArray(basicInfo.teacherInfo.classes)) {
        for (const classId of basicInfo.teacherInfo.classes) {
          if (classId && !isValidObjectId(classId)) {
            return new Response(JSON.stringify({ error: "شناسه کلاس نامعتبر است" }), {
              status: 400,
            });
          }
        }
      }
    }

    if (updateData.profile) {
      basicInfo.profile = {
        avatar: updateData.profile.avatar,
        address: updateData.profile.address,
        city: updateData.profile.city,
        nationalCode: updateData.profile.nationalCode
      };
    }

    if (basicInfo.cardNumber) {
      if (!/^\d{16}$/.test(basicInfo.cardNumber)) {
        return new Response(JSON.stringify({ error: "شماره کارت باید 16 رقمی باشد." }), {
          status: 400,
        });
      }
      if (!validateCardNumber(basicInfo.cardNumber)) {
        return new Response(JSON.stringify({ error: "شماره کارت نامعتبر است" }), {
          status: 400,
        });
      }
    }

    if (basicInfo.nationalCode) {
      if (!/^\d{10}$/.test(basicInfo.nationalCode)) {
        return new Response(JSON.stringify({ error: "کد ملی باید 10 رقمی باشد." }), {
          status: 400,
        });
      }
      if (!validateNationalCode(basicInfo.nationalCode)) {
        return new Response(JSON.stringify({ error: "کد ملی نامعتبر است" }), {
          status: 400,
        });
      }
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