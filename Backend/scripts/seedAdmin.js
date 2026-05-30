/**
 * Create first Admin user. Run once:
 *   node scripts/seedAdmin.js
 * Set in .env: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME (optional)
 */
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { pathToFileURL } from "url";
import { User } from "../models/user.model.js";

dotenv.config();

const email = process.env.ADMIN_EMAIL || "admin@jobportal.com";
const password = process.env.ADMIN_PASSWORD || "Admin@123";
const fullname = process.env.ADMIN_NAME || "System Admin";

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  const hashed = await bcrypt.hash(password, 10);
  if (existing) {
    existing.role = "Admin";
    existing.password = hashed;
    await existing.save();
    console.log("Admin ready (role + password set):", email);
  } else {
    await User.create({
      fullname,
      email: email.toLowerCase().trim(),
      phoneNumber: "9999999999",
      password: hashed,
      adharcard: "ADMIN0000000000",
      pancard: "ADMIN0000A",
      role: "Admin",
      profile: { profilePhoto: "" },
    });
    console.log("Admin created:", email, "| password:", password);
  }
  await mongoose.disconnect();
}

const isDirectRun =
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  seed().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
