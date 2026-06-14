import { connectDB } from "../../../../lib/db";
import Enrollment from "../../../../models/Enrollment";
import Product from "../../../../models/Product";
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
        console.log(`Processing product: ${productId}`);
        const product = await Product.findOne({ _id: String(productId) });
        if (!product) {
          console.log(`Product not found: ${productId}`);
          results.push({ productId, success: false, error: "دوره یافت نشد" });
          continue;
        }
        console.log(`Found product: ${product.title}`);
        const existingEnrollment = await Enrollment.findOne({
          user: decoded.id,
          product: String(productId)
        });
        if (existingEnrollment) {
          results.push({ productId, success: false, error: "قبلاً ثبت‌نام کرده‌اید" });
          continue;
        }
        const enrollment = new Enrollment({
          user: decoded.id,
          product: String(productId),
          enrolledAt: new Date(),
          progress: 0,
          completed: false,
          lastAccessed: new Date()
        });
        await enrollment.save();
        console.log(`Enrollment created for: ${product.title}`);
        await Product.findOneAndUpdate(
          { _id: String(productId) }, 
          { $inc: { studentsCount: 1 } }
        );
        results.push({ 
          productId, 
          success: true, 
          message: "ثبت‌نام موفق",
          productTitle: product.title
        });
      } catch (error) {
        console.error(`Error enrolling in product ${productId}:`, error);
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