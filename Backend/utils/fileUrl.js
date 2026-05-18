/**
 * Full URL for a file stored under /uploads/<subPath> (e.g. profiles/photo.jpg).
 */
export function getPublicUploadUrl(subPath) {
  const base = (
    process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5001}`
  ).replace(/\/$/, "");
  const clean = String(subPath).replace(/^\/+/, "");
  return `${base}/uploads/${clean}`;
}
