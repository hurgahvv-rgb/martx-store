import { NextResponse } from "next/server";

import { isAdminSessionValid } from "@/lib/admin-auth";
import { createCloudinaryUploadSignature } from "@/lib/cloudinary";

export async function POST() {
  if (!(await isAdminSessionValid())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(createCloudinaryUploadSignature("martx/products"));
  } catch (error) {
    console.error("Cloudinary signature failed", error);
    return NextResponse.json({ error: "Cloudinary is not configured." }, { status: 500 });
  }
}
