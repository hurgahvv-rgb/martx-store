import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { uploadImageToCloudinary } from "@/lib/cloudinary";

const uploadDir = path.join(process.cwd(), "public", "uploads", "orders");

function cleanFileName(name: string) {
  const ext = path.extname(name).toLowerCase() || ".jpg";
  return `${Date.now()}-${randomUUID()}${ext}`;
}

export async function saveOrderScreenshot(file: File | null) {
  if (!file || file.size === 0 || !file.type.startsWith("image/")) {
    return null;
  }

  const cloudinaryUrl = await uploadImageToCloudinary(file, "martx/orders");

  if (cloudinaryUrl) {
    return cloudinaryUrl;
  }

  await mkdir(uploadDir, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  const fileName = cleanFileName(file.name);
  await writeFile(path.join(uploadDir, fileName), bytes);

  return `/uploads/orders/${fileName}`;
}

export function getFile(formData: FormData, key: string) {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}
