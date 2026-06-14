// lib/security.js - Centralized security utilities

import mongoose from "mongoose";
import { rateLimit as sharedRateLimit } from "./rate-limiter";

export { sharedRateLimit as rateLimit };

export function sanitizeString(input) {
  if (typeof input !== "string") return input;
  return input
    .replace(/<\s*\/?\s*script[^>]*>/gi, "")
    .replace(/<\s*\/?\s*iframe[^>]*>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/\$\{/g, "")
    .trim();
}

export function sanitizeInput(obj, maxDepth = 5) {
  if (maxDepth <= 0) return obj;
  if (typeof obj === "string") return sanitizeString(obj);
  if (Array.isArray(obj))
    return obj.map((item) => sanitizeInput(item, maxDepth - 1));
  if (obj && typeof obj === "object") {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith("$")) continue;
      sanitized[key] = sanitizeInput(value, maxDepth - 1);
    }
    return sanitized;
  }
  return obj;
}

export function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function validatePasswordStrength(password) {
  const errors = [];
  if (!password || password.length < 8)
    errors.push("رمز عبور باید حداقل ۸ کاراکتر باشد");
  if (password && password.length > 128)
    errors.push("رمز عبور نباید بیش از ۱۲۸ کاراکتر باشد");
  return { valid: errors.length === 0, errors };
}

export function isValidObjectId(id) {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === id
  );
}

export function isSchoolAdmin(user) {
  return (
    user &&
    user.type === "creator"
  );
}

export function isSchoolStaff(user) {
  return (
    user &&
    (user.type === "creator" ||
      user.schoolRole === "teacher")
  );
}

export function getClientIP(request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function validateAmount(amount, max = 500000000) {
  const num = Number(amount);
  if (isNaN(num) || num <= 0)
    return { valid: false, error: "مبلغ معتبر وارد کنید" };
  if (num > max) return { valid: false, error: "مبلغ از حد مجاز بیشتر است" };
  if (!Number.isFinite(num)) return { valid: false, error: "مبلغ نامعتبر است" };
  return { valid: true };
}
