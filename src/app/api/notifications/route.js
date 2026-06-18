import { connectDB } from "../../../lib/db";
import { getUserIdFromToken } from "../../../lib/auth";
import User from "../../../models/User";
import Notification from "../../../models/Notification";
export async function GET(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز" }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر" }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = Math.min(parseInt(searchParams.get('limit')) || 20, 100);
    const skip = (page - 1) * limit;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    const total = await Notification.countDocuments({ user: userId });
    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      isRead: false 
    });
    const transformedNotifications = notifications.map(notification => ({
      ...notification,
      id: notification._id,
      _id: notification._id
    }));
    console.log("Notifications fetched for user:", userId, {
      count: transformedNotifications.length,
      unreadCount,
      page
    });
    return new Response(
      JSON.stringify({
        notifications: transformedNotifications,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        unreadCount
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return new Response(
      JSON.stringify({ error: "خطا در دریافت اعلان‌ها" }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
export async function POST(request) {
  try {
    await connectDB();
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "دسترسی غیرمجاز" }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "توکن نامعتبر" }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    const requestingUser = await User.findById(userId).select('type').lean();
    if (!requestingUser || (requestingUser.type !== 'creator' && requestingUser.type !== 'admin')) {
      return new Response(
        JSON.stringify({ error: "شما اجازه ایجاد اعلان ندارید" }),
        { 
          status: 403, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    const body = await request.json();
    const notification = await Notification.create({
      user: userId, 
      title: body.title,
      message: body.message,
      image: body.image || null,
      type: body.type || 'info',
      actionUrl: body.actionUrl || null,
      expiresAt: body.expiresAt || null
    });
    const transformedNotification = {
      ...notification.toObject(),
      id: notification._id,
      _id: notification._id
    };
    console.log("Notification created for user:", userId, {
      id: transformedNotification.id,
      title: transformedNotification.title
    });
    return new Response(
      JSON.stringify(transformedNotification),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Error creating notification:", error);
    return new Response(
      JSON.stringify({ error: "خطا در ایجاد اعلان" }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}