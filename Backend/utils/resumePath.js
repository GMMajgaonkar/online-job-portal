import path from "path";
import fs from "fs";
import { UPLOAD_ROOT } from "../middleware/multer.js";

/** Convert stored resume URL to absolute filesystem path */
export function resumeUrlToAbsolutePath(resumeUrl) {
  if (!resumeUrl) return null;
  const marker = "/uploads/";
  const idx = resumeUrl.indexOf(marker);
  if (idx === -1) return null;
  const subPath = resumeUrl.slice(idx + marker.length).split("?")[0];
  const absolute = path.join(UPLOAD_ROOT, subPath);
  return fs.existsSync(absolute) ? absolute : null;
}
