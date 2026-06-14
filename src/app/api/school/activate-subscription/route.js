/* global process */
import { connectDB } from "../../../../lib/db";
import Service from "../../../../models/Service";
import jwt from "jsonwebtoken";
import { SUBSCRIPTION_TIERS, TIER_LIMITS } from "../../../../config/subscription-limits";

const SECRET = process.env.JWT_SECRET;

function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    return { userId: jwt.verify(token, SECRET).id };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const auth = authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { schoolId, plan } = body;

    if (!schoolId) {
      return Response.json({ error: "شناسه مدرسه الزامی است" }, { status: 400 });
    }

    if (!plan || !Object.values(SUBSCRIPTION_TIERS).includes(plan)) {
      return Response.json({ error: "پلن اشتراک نامعتبر است" }, { status: 400 });
    }

    const service = await Service.findById(schoolId);
    if (!service) {
      return Response.json({ error: "مدرسه یافت نشد" }, { status: 404 });
    }

    if (service.creator.toString() !== auth.userId) {
      return Response.json({ error: "شما دسترسی به این مدرسه را ندارید" }, { status: 403 });
    }

    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    service.subscriptionPlan = plan;
    service.subscriptionStartDate = now;
    service.subscriptionExpiry = oneYearLater;
    await service.save();

    return Response.json({
      message: "اشتراک با موفقیت فعال شد",
      subscription: {
        plan: service.subscriptionPlan,
        startDate: service.subscriptionStartDate,
        expiry: service.subscriptionExpiry,
        features: TIER_LIMITS[plan].features,
        limits: {
          maxClasses: TIER_LIMITS[plan].maxClasses,
          maxStudents: TIER_LIMITS[plan].maxStudents,
          maxTeachers: TIER_LIMITS[plan].maxTeachers
        }
      }
    });
  } catch (error) {
    console.error("Error activating subscription:", error);
    return Response.json({ error: "خطا در فعال‌سازی اشتراک" }, { status: 500 });
  }
}
