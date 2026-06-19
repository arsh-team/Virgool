import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error(
    "FATAL: JWT_SECRET environment variable is not set. The application cannot start without it.",
  );
}

export function getUserIdFromToken(token) {
  try {
    if (!token) return null;
    if (!SECRET) return null;
    const actualToken = token.startsWith("Bearer ") ? token.slice(7) : token;
    const decoded = jwt.verify(actualToken, SECRET, { algorithms: ["HS256"] });
    return decoded.id;
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return null;
  }
}

/**
 * Authenticate a request and return the decoded user ID or an error response.
 * Use this in API route handlers for consistent auth checking.
 */
export async function authenticateRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: "توکن احراز هویت یافت نشد", status: 401 };
  }
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  if (!SECRET) {
    return { error: "خطای پیکربندی سرور", status: 500 };
  }
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ["HS256"] });
    return { userId: decoded.id };
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return { error: "توکن نامعتبر است", status: 401 };
  }
}

/**
 * Get the JWT secret — throws if not configured
 */
export function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
}
