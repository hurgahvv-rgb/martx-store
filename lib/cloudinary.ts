import { createHash } from "crypto";

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  const cloudinaryUrl = process.env.CLOUDINARY_URL;

  if (!cloudinaryUrl) {
    return null;
  }

  try {
    const url = new URL(cloudinaryUrl);

    if (url.protocol !== "cloudinary:") {
      return null;
    }

    return {
      cloudName: url.hostname,
      apiKey: decodeURIComponent(url.username),
      apiSecret: decodeURIComponent(url.password)
    };
  } catch {
    return null;
  }
}

function signUploadParams(params: Record<string, string | number>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");
}

export function hasCloudinaryConfig() {
  return Boolean(getCloudinaryConfig());
}

export function createCloudinaryUploadSignature(folder: string) {
  const config = getCloudinaryConfig();

  if (!config) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  const timestamp = Math.round(Date.now() / 1000);
  const uploadParams = {
    folder,
    timestamp
  };

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    folder,
    timestamp,
    signature: signUploadParams(uploadParams, config.apiSecret)
  };
}

export async function uploadImageToCloudinary(file: File, folder: string) {
  const config = getCloudinaryConfig();

  if (!config) {
    if (process.env.VERCEL) {
      throw new Error("Cloudinary environment variables are missing.");
    }

    return null;
  }

  const signedUpload = createCloudinaryUploadSignature(folder);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signedUpload.apiKey);
  formData.append("folder", folder);
  formData.append("timestamp", String(signedUpload.timestamp));
  formData.append("signature", signedUpload.signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${signedUpload.cloudName}/image/upload`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Cloudinary upload failed: ${message}`);
  }

  const result = (await response.json()) as { secure_url?: string };

  if (!result.secure_url) {
    throw new Error("Cloudinary upload did not return a secure URL.");
  }

  return result.secure_url;
}
