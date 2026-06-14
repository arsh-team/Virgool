// app/api/notifications/bulk/route.js
import { connectDB } from "../../../../lib/db";
import { getUserIdFromToken } from "../../../../lib/auth";
import Notification from "../../../../models/Notification";
import User from "../../../../models/User";

export async function POST(request) {
  try {
    await connectDB();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const user = await User.findById(userId);
    if (!user || user.type !== "creator") {
      return new Response(
        JSON.stringify({ error: "شما دسترسی ارسال اعلان دسته‌ای را ندارید" }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { notifications } = await request.json();
    
    if (!notifications || !Array.isArray(notifications) || notifications.length === 0) {
      return new Response(
        JSON.stringify({ error: "لیست اعلان‌ها معتبر نیست" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (notifications.length > 100) {
      return new Response(
        JSON.stringify({ error: "حداکثر ۱۰۰ اعلان در هر درخواست مجاز است" }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    for (const notif of notifications) {
      if (!notif.user || !notif.title || !notif.message) {
        return new Response(
          JSON.stringify({ error: "عنوان، متن و کاربر گیرنده الزامی است" }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
    const uniqueNotifications = [];
    const seenUsers = new Set();
    
    for (const notif of notifications) {
      const userIdStr = notif.user.toString();
      if (!seenUsers.has(userIdStr)) {
        seenUsers.add(userIdStr);
        uniqueNotifications.push(notif);
      }
    }
    
    const createdNotifications = uniqueNotifications.length > 0
      ? await Notification.insertMany(uniqueNotifications.map(notif => ({
          user: notif.user,
          title: notif.title,
          message: notif.message,
          image: notif.image || null,
          type: notif.type || "info",
          actionUrl: notif.actionUrl || null,
          expiresAt: notif.expiresAt || null
        })))
      : [];
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `${createdNotifications.length} اعلان با موفقیت ارسال شد`,
        count: createdNotifications.length
      }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error in bulk notification:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ارسال اعلان‌ها" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}