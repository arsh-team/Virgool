// app/api/creator/top-students/route.js
import { connectDB } from "../../../../lib/db";
import { getUserIdFromToken } from "../../../../lib/auth";
import mongoose from "mongoose";
import MonthlyScore from "../../../../models/MonthlyScore";
import User from "../../../../models/User";
import Class from "../../../../models/Class";
import Service from "../../../../models/Service";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const isValidObjectId = (value) => value && mongoose.Types.ObjectId.isValid(value);

export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get("authorization");
    if (!authHeader) return json({ error: "دسترسی غیرمجاز" }, 401);

    const userId = getUserIdFromToken(authHeader);
    if (!userId) return json({ error: "توکن نامعتبر" }, 401);

    const user = await User.findById(userId).select("type");
    if (!user || user.type !== "creator") {
      return json({ error: "دسترسی غیرمجاز" }, 403);
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("schoolId");
    const classId = searchParams.get("classId");
    const grade = searchParams.get("grade");
    const academicYear = searchParams.get("academicYear") || "1404-1405";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit"), 10) || 10, 1), 100);

    if (!isValidObjectId(schoolId)) {
      return json({ error: "شناسه مدرسه معتبر نیست" }, 400);
    }

    const service = await Service.findOne({ _id: schoolId, fromUserId: userId });
    if (!service) {
      return json({ error: "شما دسترسی به این مدرسه ندارید" }, 403);
    }

    const matchQuery = {
      school: new mongoose.Types.ObjectId(schoolId),
      academicYear,
      average: { $ne: null },
    };

    let scopeTitle = "کل مدرسه";
    let scopedClassIds = [];

    if (isValidObjectId(classId)) {
      matchQuery.class = new mongoose.Types.ObjectId(classId);
      const selectedClass = await Class.findOne({
        _id: classId,
        school: schoolId,
      }).select("name grade").lean();
      scopeTitle = selectedClass ? `${selectedClass.name} - پایه ${selectedClass.grade}` : "کلاس انتخاب شده";
    } else if (grade) {
      const gradeClasses = await Class.find({
        school: schoolId,
        academicYear,
        grade,
      }).select("_id name grade").lean();

      scopedClassIds = gradeClasses.map((item) => item._id);
      matchQuery.class = { $in: scopedClassIds };
      scopeTitle = `پایه ${grade}`;
    }

    const topStudents = await MonthlyScore.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: "$student",
          totalAverage: { $avg: "$average" },
          scoreCount: { $sum: 1 },
          bestScore: { $max: "$average" },
          latestMonthNumber: { $max: "$monthNumber" },
          classIds: { $addToSet: "$class" },
          subjectIds: { $addToSet: "$subject" },
        },
      },
      { $sort: { totalAverage: -1, scoreCount: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "classes",
          localField: "classIds",
          foreignField: "_id",
          as: "classes",
        },
      },
      {
        $project: {
          _id: "$student._id",
          firstname: "$student.firstname",
          lastname: "$student.lastname",
          email: "$student.email",
          phone: "$student.phone",
          studentInfo: "$student.studentInfo",
          totalAverage: { $round: ["$totalAverage", 2] },
          bestScore: { $round: ["$bestScore", 2] },
          latestMonthNumber: 1,
          scoreCount: 1,
          subjectCount: { $size: "$subjectIds" },
          classes: {
            $map: {
              input: "$classes",
              as: "cls",
              in: {
                _id: "$$cls._id",
                name: "$$cls.name",
                grade: "$$cls.grade",
              },
            },
          },
        },
      },
    ]);

    return json({
      topStudents,
      scope: {
        schoolId,
        classId: classId || null,
        grade: grade || null,
        academicYear,
        limit,
        title: scopeTitle,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching top students:", error);
    return json({ error: "خطا در دریافت برترین دانش‌آموزان" }, 500);
  }
}
