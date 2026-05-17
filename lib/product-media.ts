import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

import { uploadImageToCloudinary } from "@/lib/cloudinary";

const uploadDir = path.join(process.cwd(), "public", "uploads", "products");

function cleanFileName(name: string) {
  const ext = path.extname(name).toLowerCase() || ".jpg";
  return `${Date.now()}-${randomUUID()}${ext}`;
}

export async function saveProductImages(files: File[]) {
  const images: string[] = [];
  const imageFiles = files.filter((file) => file && file.size > 0 && file.type.startsWith("image/"));

  if (imageFiles.length === 0) {
    return images;
  }

  await mkdir(uploadDir, { recursive: true });

  for (const file of imageFiles) {
    const cloudinaryUrl = await uploadImageToCloudinary(file, "martx/products");

    if (cloudinaryUrl) {
      images.push(cloudinaryUrl);
      continue;
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const fileName = cleanFileName(file.name);
    await writeFile(path.join(uploadDir, fileName), bytes);
    images.push(`/uploads/products/${fileName}`);
  }

  return images;
}

export function getFiles(formData: FormData, key: string) {
  return formData.getAll(key).filter((value): value is File => value instanceof File && value.size > 0);
}
