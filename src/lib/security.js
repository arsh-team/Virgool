// lib/security.js - Centralized security utilities

import mongoose from "mongoose";
import { rateLimit as sharedRateLimit } from "./rate-limiter";

export { sharedRateLimit as rateLimit };

export function sanitizeString(input) {
  if (typeof input !== "string") return input;
  // WARNING: This is a basic sanitizer. For production, use DOMPurify or similar.
  let str = input;
  // Decode HTML entities first to prevent bypass
  str = str.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
  str = str.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
  str = str.replace(/&amp;/gi, '&').replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"');
  // Now sanitize
  str = str
    .replace(/<\s*\/?\s*script[^>]*>/gi, "")
    .replace(/<\s*\/?\s*iframe[^>]*>/gi, "")
    .replace(/<\s*\/?\s*object[^>]*>/gi, "")
    .replace(/<\s*\/?\s*embed[^>]*>/gi, "")
    .replace(/<\s*\/?\s*form[^>]*>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/vbscript\s*:/gi, "")
    .replace(/data\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "data-removed=")
    .replace(/\$\{/g, "")
    .trim();
  return str;
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
  if (!password || password.length < 8) {
    errors.push("رمز عبور باید حداقل ۸ کاراکتر باشد");
  }
  if (password && password.length > 128) {
    errors.push("رمز عبور نمی‌تواند بیشتر از ۱۲۸ کاراکتر باشد");
  }
  if (password && !/[A-Z]/.test(password)) {
    errors.push("رمز عبور باید حداقل یک حرف بزرگ انگلیسی داشته باشد");
  }
  if (password && !/[a-z]/.test(password)) {
    errors.push("رمز عبور باید حداقل یک حرف کوچک انگلیسی داشته باشد");
  }
  if (password && !/[0-9]/.test(password)) {
    errors.push("رمز عبور باید حداقل یک عدد داشته باشد");
  }
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

export function isSchoolStaff(user, schoolId) {
  if (!user) return false;
  if (user.type === "creator" && (!schoolId || user.school?.toString() === schoolId?.toString())) return true;
  if (user.schoolRole === "teacher" && (!schoolId || user.school?.toString() === schoolId?.toString())) return true;
  return false;
}

export function getClientIP(request) {
  // WARNING: X-Forwarded-For can be spoofed by clients.
  // Configure your reverse proxy to overwrite this header.
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function validateAmount(amount) {
  if (typeof amount !== 'number' && typeof amount !== 'string') return { valid: false, error: "مبلغ نامعتبر است" };
  const num = Number(amount);
  if (isNaN(num) || num <= 0) return { valid: false, error: "مبلغ باید بیشتر از صفر باشد" };
  if (num > 999999999999) return { valid: false, error: "مبلغ بیش از حد مجاز است" };
  return { valid: true, amount: num };
}
