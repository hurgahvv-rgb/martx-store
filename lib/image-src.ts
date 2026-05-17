const FALLBACK_IMAGE = "/martx-logo.png";

function isUsableImageSrc(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const src = value.trim();

  if (!src) {
    return false;
  }

  return src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://") || src.startsWith("data:image/");
}

export function normalizeImageSrc(value: unknown) {
  return isUsableImageSrc(value) ? value.trim() : FALLBACK_IMAGE;
}

export { FALLBACK_IMAGE };
