// lib/subscription-check.js
// Centralized subscription limit checking utility for Route Handlers and Server Actions

import { connectDB } from "./db";
import mongoose from "mongoose";
import User from "../models/User";
import Class from "../models/Class";
import Service from "../models/Service";
import { 
  SUBSCRIPTION_TIERS, 
  TIER_LIMITS, 
  getTierLimits, 
  hasFeature,
  getTierDisplayName 
} from "../config/subscription-limits";

/**
 * Get the current user with their subscription info
 * @param {string} userId - The user ID
 * @returns {Promise<object|null>} - The user object or null
 */
export async function getUserWithSubscription(userId) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) return null;
  
  // Default to BRONZE if no subscription tier is set
  if (!user.subscriptionTier) {
    user.subscriptionTier = SUBSCRIPTION_TIERS.BRONZE;
  }
  
  return user;
}

/**
 * Get the school's subscription info from the Service model
 * @param {string} schoolId - The school/service ID
 * @returns {Promise<object|null>} - The school subscription object or null
 */
export async function getSchoolSubscription(schoolId) {
  await connectDB();
  const school = await Service.findById(schoolId).select('subscriptionPlan subscriptionStartDate subscriptionExpiry').lean();
  if (!school) return null;
  return school;
}

/**
 * Check if a subscription entity (user or school) has an active subscription
 * @param {object} entity - The user or school object
 * @returns {boolean} - True if subscription is active
 */
export function isSubscriptionActive(entity) {
  if (!entity) return false;
  const tier = entity.subscriptionTier || entity.subscriptionPlan;
  if (!tier || tier === 'BRONZE') {
    if (!entity.subscriptionExpiry) return false;
  }
  if (!entity.subscriptionExpiry) return true;
  return new Date(entity.subscriptionExpiry) > new Date();
}

/**
 * Count the number of classes for a school
 * @param {string} schoolId - The school/service ID
 * @returns {Promise<number>} - The count of classes
 */
export async function countClasses(schoolId) {
  await connectDB();
  return await Class.countDocuments({ school: schoolId });
}

/**
 * Count the number of students for a school
 * @param {string} schoolId - The school/service ID
 * @returns {Promise<number>} - The count of students
 */
export async function countStudents(schoolId) {
  await connectDB();
  const query = { schoolRole: 'student' };
  if (schoolId) {
    const schoolClasses = await Class.find({ school: schoolId }).select("_id").lean();
    const classIds = schoolClasses.map(c => c._id);
    query.$or = [
      { school: new mongoose.Types.ObjectId(schoolId) },
      { 'studentInfo.enrolledClass': { $in: classIds } }
    ];
  }
  return await User.countDocuments(query);
}

/**
 * Count the number of teachers for a school
 * @param {string} schoolId - The school/service ID
 * @returns {Promise<number>} - The count of teachers
 */
export async function countTeachers(schoolId) {
  await connectDB();
  const query = { schoolRole: 'teacher' };
  if (schoolId) {
    const schoolClasses = await Class.find({ school: schoolId }).select("teacher assistantTeacher").lean();
    const teacherIds = schoolClasses
      .flatMap(cls => [cls.teacher, cls.assistantTeacher])
      .filter(Boolean);
    const schoolSubjects = await (await import('../models/Subject')).default.find({ school: schoolId }).select("teacher").lean();
    teacherIds.push(...schoolSubjects.map(s => s.teacher).filter(Boolean));
    const uniqueTeacherIds = [...new Set(teacherIds.map(id => id.toString()))];
    query.$or = [
      { school: new mongoose.Types.ObjectId(schoolId) },
      { _id: { $in: uniqueTeacherIds } }
    ];
  }
  return await User.countDocuments(query);
}

/**
 * Check subscription limit before creating a resource
 * @param {string} userId - The user ID performing the action
 * @param {string} resourceType - The type of resource ('classes', 'students', 'teachers')
 * @param {string} schoolId - The school/service ID
 * @returns {Promise<object>} - Result object with success, error, and currentCount
 */
export async function checkSubscriptionLimit(userId, resourceType, schoolId) {
  try {
    const user = await getUserWithSubscription(userId);
    
    if (!user) {
      return {
        success: false,
        error: 'کاربر یافت نشد',
        status: 404
      };
    }
    
    // Check Service (School) subscription first, then fall back to User
    let subscriptionTier = user.subscriptionTier || SUBSCRIPTION_TIERS.BRONZE;
    let subscriptionExpiry = user.subscriptionExpiry;
    
    if (schoolId) {
      const school = await getSchoolSubscription(schoolId);
      if (school) {
        subscriptionTier = school.subscriptionPlan || subscriptionTier;
        subscriptionExpiry = school.subscriptionExpiry || subscriptionExpiry;
      }
    }
    
    const subscriptionEntity = { subscriptionTier, subscriptionExpiry };
    if (!isSubscriptionActive(subscriptionEntity)) {
      return {
        success: false,
        error: 'اشتراک شما منقضی شده است. لطفاً اشتراک خود را تمدید کنید.',
        status: 403
      };
    }
    
    const tier = subscriptionTier;
    const limits = getTierLimits(tier);
    
    let currentCount = 0;
    let maxCount = 0;
    let resourceName = '';
    
    switch (resourceType) {
      case 'classes':
        currentCount = await countClasses(schoolId);
        maxCount = limits.maxClasses;
        resourceName = 'کلاس';
        break;
      case 'students':
        currentCount = await countStudents(schoolId);
        maxCount = limits.maxStudents;
        resourceName = 'دانش‌آموز';
        break;
      case 'teachers':
        currentCount = await countTeachers(schoolId);
        maxCount = limits.maxTeachers;
        resourceName = 'دبیر';
        break;
      default:
        return {
          success: false,
          error: 'نوع منبع نامعتبر است',
          status: 400
        };
    }
    
    // Check if limit is reached (Infinity means no limit)
    if (maxCount !== Infinity && currentCount >= maxCount) {
      return {
        success: false,
        error: `حداکثر تعداد ${resourceName} برای اشتراک ${getTierDisplayName(tier)} تکمیل شده است (${currentCount} از ${maxCount}). برای افزایش محدودیت، اشتراک خود را ارتقا دهید.`,
        status: 403,
        currentCount,
        maxCount,
        limitReached: true
      };
    }
    
    return {
      success: true,
      currentCount,
      maxCount,
      limitReached: false
    };
    
  } catch (error) {
    console.error('Error checking subscription limit:', error);
    return {
      success: false,
      error: 'خطا در بررسی محدودیت اشتراک',
      status: 500
    };
  }
}

/**
 * Check if a feature is available for the user's subscription tier
 * @param {string} userId - The user ID
 * @param {string} feature - The feature to check
 * @returns {Promise<object>} - Result object with success, error, and available
 */
export async function checkFeatureAccess(userId, feature) {
  try {
    const user = await getUserWithSubscription(userId);
    
    if (!user) {
      return {
        success: false,
        error: 'کاربر یافت نشد',
        status: 404
      };
    }
    
    // Check Service (School) subscription first, then fall back to User
    let subscriptionTier = user.subscriptionTier || SUBSCRIPTION_TIERS.BRONZE;
    let subscriptionExpiry = user.subscriptionExpiry;
    
    if (user.school) {
      const school = await getSchoolSubscription(user.school);
      if (school) {
        subscriptionTier = school.subscriptionPlan || subscriptionTier;
        subscriptionExpiry = school.subscriptionExpiry || subscriptionExpiry;
      }
    }
    
    const subscriptionEntity = { subscriptionTier, subscriptionExpiry };
    if (!isSubscriptionActive(subscriptionEntity)) {
      return {
        success: false,
        error: 'اشتراک شما منقضی شده است. لطفاً اشتراک خود را تمدید کنید.',
        status: 403
      };
    }
    
    const tier = subscriptionTier;
    const available = hasFeature(tier, feature);
    
    if (!available) {
      return {
        success: false,
        error: `این ویژگی در اشتراک ${getTierDisplayName(tier)} موجود نیست. لطفاً اشتراک خود را ارتقا دهید.`,
        status: 403,
        available: false,
        currentTier: tier
      };
    }
    
    return {
      success: true,
      available: true,
      currentTier: tier
    };
    
  } catch (error) {
    console.error('Error checking feature access:', error);
    return {
      success: false,
      error: 'خطا در بررسی دسترسی به ویژگی',
      status: 500
    };
  }
}

/**
 * Middleware wrapper for route handlers to check subscription limits
 * @param {Request} request - The request object
 * @param {string} resourceType - The type of resource to check
 * @param {Function} handler - The handler function to call if check passes
 * @returns {Promise<Response>} - The response
 */
export async function withSubscriptionCheck(request, resourceType, handler) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return Response.json(
        { error: "توکن احراز هویت یافت نشد" },
        { status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { getJwtSecret } = await import("./auth");
    const jsonwebtoken = await import('jsonwebtoken');
    let SECRET;
    try {
      SECRET = getJwtSecret();
    } catch {
      return Response.json(
        { error: "خطای پیکربندی سرور" },
        { status: 500 }
      );
    }
    
    let decoded;
    try {
      decoded = jsonwebtoken.default.verify(token, SECRET);
    } catch {
      return Response.json(
        { error: "توکن نامعتبر است" },
        { status: 401 }
      );
    }
    
    const userId = decoded.id;
    
    // Extract schoolId from URL or request body
    const { searchParams } = new URL(request.url);
    let schoolId = searchParams.get("schoolId");
    
    if (!schoolId) {
      const body = await request.clone().json().catch(() => ({}));
      schoolId = body.schoolId;
    }
    
    if (!schoolId) {
      return Response.json(
        { error: "شناسه مدرسه الزامی است" },
        { status: 400 }
      );
    }
    
    const limitCheck = await checkSubscriptionLimit(userId, resourceType, schoolId);
    
    if (!limitCheck.success) {
      return Response.json(
        { error: limitCheck.error, ...limitCheck },
        { status: limitCheck.status || 400 }
      );
    }
    
    return await handler(request, { userId, schoolId, limitCheck });
    
  } catch (error) {
    console.error('Error in subscription check middleware:', error);
    return Response.json(
      { error: "خطا در بررسی اشتراک" },
      { status: 500 }
    );
  }
}

export { SUBSCRIPTION_TIERS, TIER_LIMITS, getTierLimits, hasFeature, getTierDisplayName };
