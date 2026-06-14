import { connectDB } from "../../../../lib/db";
import Enrollment from "../../../../models/Enrollment";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: "توکن احراز هویت یافت نشد" }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(JSON.stringify({ error: "توکن نامعتبر است" }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    const enrollments = await Enrollment.find({ user: decoded.id })
      .populate('product', 'title category level hours rating score teacher image')
      .sort({ lastAccessed: -1 });
    return new Response(JSON.stringify(enrollments), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return new Response(JSON.stringify({ error: "خطا در سرور" }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}