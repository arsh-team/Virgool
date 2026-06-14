// app/api/auth/me/route.js
import { connectDB } from "../../../../lib/db";
import User from "../../../../models/User";
import Subject from "../../../../models/Subject";
import Class from "../../../../models/Class";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";

export async function GET(request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json({ error: "توکن احراز هویت یافت نشد" }, { status: 401 });
    }
    
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return Response.json({ error: "توکن نامعتبر است" }, { status: 401 });
    }
    
    const user = await User.findById(decoded.id)
      .select("-password")
      .populate('studentInfo.enrolledClass', 'name grade')
      .populate('teacherInfo.subjects', 'name code')
      .populate('teacherInfo.classes', 'name grade')
      .lean();
    
    if (!user) {
      return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }
    
    return Response.json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    return Response.json({ error: "خطا در دریافت اطلاعات کاربر" }, { status: 500 });
  }
}