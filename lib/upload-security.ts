const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const maxImageSize = 8 * 1024 * 1024;

export function isSafeImageFile(file: File) {
  return file.size > 0 && file.size <= maxImageSize && allowedImageTypes.has(file.type);
}
