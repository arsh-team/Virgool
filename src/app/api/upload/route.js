import { connectDB } from "../../../lib/db";
import { getUserIdFromToken } from "../../../lib/auth";
import { uploadToS3, isS3Configured } from "../../../lib/s3";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    await connectDB();

    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return Response.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    const userId = getUserIdFromToken(authHeader);
    if (!userId) {
      return Response.json({ error: "توکن نامعتبر" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") || "uploads";

    if (!file) {
      return Response.json({ error: "فایلی ارسال نشد" }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: "حجم فایل نباید بیشتر از 5 مگابایت باشد" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: "فرمت تصویر نامعتبر است" }, { status: 400 });
    }

    if (isS3Configured()) {
      const url = await uploadToS3(file, folder);
      return Response.json({ url, storage: "s3" }, { status: 200 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    return Response.json({ url: dataUrl, storage: "base64" }, { status: 200 });
  } catch (error) {
    console.error("Upload error:", error);
    return Response.json({ error: "خطا در آپلود فایل" }, { status: 500 });
  }
}
