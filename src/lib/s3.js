import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

let s3Client = null;

function isS3Configured() {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET
  );
}

function getS3Client() {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
}

function getBucketName() {
  return process.env.AWS_S3_BUCKET;
}

function getS3BaseUrl() {
  const bucket = getBucketName();
  const region = process.env.AWS_REGION || "us-east-1";
  if (process.env.AWS_S3_ENDPOINT) {
    return `${process.env.AWS_S3_ENDPOINT}/${bucket}`;
  }
  return `https://${bucket}.s3.${region}.amazonaws.com`;
}

function generateKey(folder, filename) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split(".").pop().toLowerCase();
  const safeFilename = `${timestamp}-${random}.${ext}`;
  return `${folder}/${safeFilename}`;
}

export async function uploadToS3(file, folder = "uploads") {
  if (!isS3Configured()) {
    return null;
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = generateKey(folder, file.name || "unknown.jpg");

  const command = new PutObjectCommand({
    Bucket: getBucketName(),
    Key: key,
    Body: buffer,
    ContentType: file.type || "application/octet-stream",
    ACL: "public-read",
  });

  await getS3Client().send(command);
  return `${getS3BaseUrl()}/${key}`;
}

export async function deleteFromS3(url) {
  if (!isS3Configured() || !url) return;

  const baseUrl = getS3BaseUrl();
  if (!url.startsWith(baseUrl)) return;

  const key = url.replace(`${baseUrl}/`, "");

  const command = new DeleteObjectCommand({
    Bucket: getBucketName(),
    Key: key,
  });

  await getS3Client().send(command);
}

export { isS3Configured };
