import { connectDB } from "../../../../lib/db";
import UserProgress from "../../../../models/UserProgress";
import Enrollment from "../../../../models/Enrollment";
import Lesson from "../../../../models/Lesson";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
function parseDuration(duration) {
  const hoursMatch = duration.match(/(\d+)\s*ساعت/);
  const minutesMatch = duration.match(/(\d+)\s*دقیقه/);
  let totalMinutes = 0;
  if (hoursMatch) totalMinutes += parseInt(hoursMatch[1]) * 60;
  if (minutesMatch) totalMinutes += parseInt(minutesMatch[1]);
  return totalMinutes;
}
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
    const { productId, lessonId, progress, watchedDuration, totalDuration, videoCompleted } = await request.json();
    console.log("Updating progress:", { productId, lessonId, progress, watchedDuration, videoCompleted });

    // Validate progress value
    if (typeof progress !== 'number' || progress < 0 || progress > 100) {
      return new Response(
        JSON.stringify({ error: "مقدار پیشرفت نامعتبر است" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Video completion should only be set after sufficient progress
    if (videoCompleted && progress < 90) {
      return new Response(
        JSON.stringify({ error: "پیشرفت نمی‌تواند کاهش یابد" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lesson = await Lesson.findOne({ _id: lessonId });
    const lessonDuration = totalDuration || (lesson ? parseDuration(lesson.duration) * 60 : 0);
    const existingProgress = await UserProgress.findOne({
      user: decoded.id,
      product: productId,
      lesson: lessonId
    });

    // For progress updates, ensure progress can only increase
    if (existingProgress && progress < existingProgress.progress) {
      return new Response(
        JSON.stringify({ error: "پیشرفت نمی‌تواند کاهش یابد" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let finalProgress = progress;
    let finalWatchedDuration = watchedDuration || 0;
    let finalVideoCompleted = videoCompleted || false;
    if (existingProgress) {
      console.log("Existing progress:", existingProgress.progress, "New progress:", progress);
      console.log("Existing watchedDuration:", existingProgress.watchedDuration, "New watchedDuration:", watchedDuration);
      if (watchedDuration < existingProgress.watchedDuration && !videoCompleted) {
        finalWatchedDuration = existingProgress.watchedDuration;
        console.log("Keeping existing watched duration:", finalWatchedDuration);
      }
      if (existingProgress.videoCompleted) {
        finalVideoCompleted = true;
        finalProgress = 100;
        finalWatchedDuration = existingProgress.totalDuration; 
      }
    }
    const userProgress = await UserProgress.findOneAndUpdate(
      { 
        user: decoded.id, 
        product: productId, 
        lesson: lessonId 
      },
      {
        user: decoded.id,
        product: productId,
        lesson: lessonId,
        progress: finalProgress,
        watchedDuration: finalWatchedDuration,
        totalDuration: lessonDuration,
        videoCompleted: finalVideoCompleted,
        completed: finalVideoCompleted,
        lastWatchedAt: new Date()
      },
      { upsert: true, new: true, runValidators: true }
    );
    console.log("Progress saved:", userProgress.progress, "Video completed:", userProgress.videoCompleted, "Watched duration:", userProgress.watchedDuration);
    const totalLessons = await Lesson.countDocuments({ product: productId });
    const completedLessons = await UserProgress.countDocuments({ 
      user: decoded.id, 
      product: productId,
      videoCompleted: true
    });
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    await Enrollment.findOneAndUpdate(
      { user: decoded.id, product: productId },
      { 
        progress: overallProgress,
        completed: overallProgress === 100,
        lastAccessed: new Date()
      }
    );
    return new Response(
      JSON.stringify({
        message: "پیشرفت با موفقیت ذخیره شد",
        progress: userProgress.progress,
        watchedDuration: userProgress.watchedDuration,
        completed: userProgress.completed,
        videoCompleted: userProgress.videoCompleted
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error updating progress:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ذخیره پیشرفت" }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
export async function GET(request) {
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
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const lessonId = searchParams.get('lessonId');
    if (!productId || !lessonId || lessonId === 'undefined') {
      console.log("Invalid parameters:", { productId, lessonId });
      return new Response(
        JSON.stringify({ 
          error: "پارامترهای نامعتبر",
          productId,
          lessonId 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (!lessonId) {
      console.log("Invalid lessonId:", lessonId);
      return new Response(
        JSON.stringify({ 
          error: "شناسه درس نامعتبر است",
          lessonId 
        }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    console.log("Fetching progress for:", { user: decoded.id, productId, lessonId });
    const existingProgress = await UserProgress.findOne({
      user: decoded.id,
      product: productId,
      lesson: lessonId
    });
    console.log("Found progress:", existingProgress);
    return new Response(
      JSON.stringify({
        progress: existingProgress,
        success: true
      }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error("Error fetching progress:", error);
    return new Response(
      JSON.stringify({
        error: "خطا در دریافت پیشرفت",
        success: false
      }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}