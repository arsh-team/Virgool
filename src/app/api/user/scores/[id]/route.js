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
    } catch (_error) {
      return Response.json(
        { error: "توکن نامعتبر است" },
        { status: 401 }
      );
    }
    const scores = await Score.find({
      user: decoded.id,
      service: id
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
