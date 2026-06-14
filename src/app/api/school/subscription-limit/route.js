// app/api/school/subscription-limit/route.js
import { connectDB } from "../../../../lib/db";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../../../../lib/auth";
import { 
  getUserWithSubscription,
  getSchoolSubscription,
  countClasses,
  countStudents,
  countTeachers,
  getTierLimits,
  getTierDisplayName
} from "../../../../lib/subscription-check";

async function authenticate(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    return { userId: decoded.id };
  } catch {
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    const auth = await authenticate(request);
    if (auth.error) {
      return Response.json({ error: auth.error }, { status: auth.status });
    }
    
    const { searchParams } = new URL(request.url);
    const resourceType = searchParams.get("resourceType");
    const schoolId = searchParams.get("schoolId");
    
    if (!resourceType || !schoolId) {
      return Response.json({ 
        error: "پارامترهای resourceType و schoolId الزامی هستند" 
      }, { status: 400 });
    }
    
    // Validate resourceType
    const validResourceTypes = ['classes', 'students', 'teachers'];
    if (!validResourceTypes.includes(resourceType)) {
      return Response.json({ 
        error: "نوع منبع نامعتبر است" 
      }, { status: 400 });
    }
    
    // Get user subscription info
    const user = await getUserWithSubscription(auth.userId);
    if (!user) {
      return Response.json({ error: "کاربر یافت نشد" }, { status: 404 });
    }
    
    // Get current count based on resource type
    let currentCount = 0;
    switch (resourceType) {
      case 'classes':
        currentCount = await countClasses(schoolId);
        break;
      case 'students':
        currentCount = await countStudents(schoolId);
        break;
      case 'teachers':
        currentCount = await countTeachers(schoolId);
        break;
    }
    
    // Get subscription tier - check Service first, then User
    let tier = user.subscriptionTier || 'BRONZE';
    let subscriptionExpiry = user.subscriptionExpiry;
    
    const school = await getSchoolSubscription(schoolId);
    if (school) {
      tier = school.subscriptionPlan || tier;
      subscriptionExpiry = school.subscriptionExpiry || subscriptionExpiry;
    }
    
    const limits = getTierLimits(tier);
    const maxCount = limits[`max${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)}`];
    
    return Response.json({
      resourceType,
      currentCount,
      maxCount,
      isUnlimited: maxCount === Infinity,
      limitReached: maxCount !== Infinity && currentCount >= maxCount,
      remaining: maxCount === Infinity ? Infinity : Math.max(0, maxCount - currentCount),
      tier,
      tierName: getTierDisplayName(tier),
      subscriptionExpiry,
      isActive: !subscriptionExpiry || new Date(subscriptionExpiry) > new Date()
    });
    
  } catch (error) {
    console.error("Error fetching subscription limit:", error);
    return Response.json({ 
      error: "خطا در دریافت اطلاعات محدودیت اشتراک"
    }, { status: 500 });
  }
}
