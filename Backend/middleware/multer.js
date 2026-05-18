import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Root folder for all uploaded files (served at /uploads) */
export const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");

export function ensureUploadDirs() {
  for (const dir of ["profiles", "resumes", "companies"]) {
    fs.mkdirSync(path.join(UPLOAD_ROOT, dir), { recursive: true });
  }
}

function uniqueFilename(originalname) {
  const ext = path.extname(originalname || "") || "";
  const base = path
    .basename(originalname || "file", ext)
    .replace(/[^\w.-]/g, "_")
    .slice(0, 60);
  return `${Date.now()}_${Math.round(Math.random() * 1e9)}_${base || "file"}${ext}`;
}

function makeDiskStorage(subfolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(UPLOAD_ROOT, subfolder);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, uniqueFilename(file.originalname));
    },
  });
}

/** Registration profile photo (field name: file) */
export const singleUploadProfile = multer({
  storage: makeDiskStorage("profiles"),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("file");

/** Profile resume / documents (field name: file) */
export const singleUploadResume = multer({
  storage: makeDiskStorage("resumes"),
  limits: { fileSize: 15 * 1024 * 1024 },
}).single("file");

/** Company logo (field name: file) */
export const singleUploadCompany = multer({
  storage: makeDiskStorage("companies"),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("file");
