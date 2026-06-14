// app/api/services/[id]/periods/route.js
import { connectDB } from "../../../../../lib/db";
import Period from "../../../../../models/Periods";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";
import { NextResponse } from "next/server";
export async function GET(request, { params }) {
  try {
    await connectDB();
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "توکن احراز هویت یافت نشد" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let _decoded;
    try {
      _decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return NextResponse.json(
        { error: "توکن نامعتبر است" },
        { status: 401 }
      );
    }
    const serviceId = params.id;
    const periods = await Period.find({ service: serviceId }).lean();
    return NextResponse.json({ periods });
  } catch (error) {
    console.error("خطا در دریافت ترم‌ها:", error);
    return NextResponse.json(
      { error: "خطا در دریافت ترم‌ها" },
      { status: 500 }
    );
  }
}