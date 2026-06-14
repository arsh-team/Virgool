// app/api/user/scores/[id]/route.js
import Period from "../../../../../models/Periods";
import { connectDB } from "../../../../../lib/db";
import Score from "../../../../../models/Score";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../../lib/auth";
export async function GET(request, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "توکن احراز هویت یافت نشد" },
        { status: 401 }
      );
    }
    const token = authHeader.replace("Bearer ", "");
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (error) {
      return Response.json(
        { error: "توکن نامعتبر است" },
        { status: 401 }
      );
    }
    const period = await Period.findOne({ service: id })
    .sort({ _id: -1 }) 
    .lean();
    const periodId = period ? period._id : null;
    const scores = await Score.find({
      user: decoded.id,
      forPeriodId: periodId
    });
    return Response.json({ scores });
  } catch (error) {
    console.error("Error fetching scores:", error);
    return Response.json(
      { error: "خطا در دریافت نمرات" },
      { status: 500 }
    );
  }
}
