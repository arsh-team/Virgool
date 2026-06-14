// app/api/school/teacher-classes/route.js
import { connectDB } from "../../../../lib/db";
import Class from "../../../../models/Class";
import Service from "../../../../models/Service";
import User from "../../../../models/User";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";

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

export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const classes = await Class.find({ 
      teacher: auth.userId 
    }).populate("school", "title description poster");
    
    return Response.json({ classes });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return Response.json({ error: "خطا در دریافت کلاس‌ها" }, { status: 500 });
  }
}