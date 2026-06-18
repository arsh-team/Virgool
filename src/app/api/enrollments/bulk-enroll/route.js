import { connectDB } from "../../../../lib/db";
import Enrollment from "../../../../models/Enrollment";
import Service from "../../../../models/Service";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
export async function POST(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "توکن احراز هویت یافت نشد" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch (_error) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر است" }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const { productIds } = await request.json();
    console.log("Bulk enrollment request:", productIds);
    console.log("User ID:", decoded.id);
    if (!productIds || !Array.isArray(productIds)) {
      return new Response(
        JSON.stringify({ error: "لیست دوره‌ها نامعتبر است" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (productIds.length === 0) {
      return new Response(
        JSON.stringify({ error: "لیست دوره‌ها خالی است" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (productIds.length > 50) {
      return new Response(
        JSON.stringify({ error: "حداکثر ۵۰ دوره در هر درخواست مجاز است" }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const results = [];
    for (const productId of productIds) {
      try {
        console.log(`Processing service: ${productId}`);
        const service = await Service.findOne({ _id: String(productId) });
        if (!service) {
          console.log(`Service not found: ${productId}`);
          results.push({ productId, success: false, error: "دوره یافت نشد" });
          continue;
        }
        console.log(`Found service: ${service.title}`);
        const existingEnrollment = await Enrollment.findOne({
          user: decoded.id,
          service: String(productId)
        });
        if (existingEnrollment) {
          results.push({ productId, success: false, error: "قبلاً ثبت‌نام کرده‌اید" });
          continue;
        }
        const amount = service.priceAfterDiscount !== undefined ? service.priceAfterDiscount : (service.price || 0);
        const enrollment = new Enrollment({
          user: decoded.id,
          service: String(productId),
          amount: amount,
          enrolledAt: new Date(),
          progress: 0,
          completed: false,
          lastAccessed: new Date()
        });
        await enrollment.save();
        console.log(`Enrollment created for: ${service.title}`);
        await Service.findOneAndUpdate(
          { _id: String(productId) }, 
          { $inc: { studentsCount: 1 } }
        );
        results.push({ 
          productId, 
          success: true, 
          message: "ثبت‌نام موفق",
          productTitle: service.title
        });
      } catch (error) {
        console.error(`Error enrolling in service ${productId}:`, error);
        results.push({ 
          productId, 
          success: false, 
          error: "خطا در ثبت‌نام" 
        });
      }
    }
    const successfulEnrollments = results.filter(result => result.success);
    return new Response(
      JSON.stringify({ 
        message: `ثبت‌نام در ${successfulEnrollments.length} از ${productIds.length} دوره انجام شد`,
        results,
        successfulCount: successfulEnrollments.length,
        totalCount: productIds.length
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error in bulk enrollment:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ثبت‌نام گروهی" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}