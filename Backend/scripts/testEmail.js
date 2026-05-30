/**
 * Test SMTP: node scripts/testEmail.js your-test@email.com
 * Requires SMTP_* in Backend/.env (not .env.example)
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { sendShortlistNotification, isSmtpConfigured } from "../services/email.service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const to = process.argv[2] || process.env.SMTP_USER;

if (!isSmtpConfigured()) {
  console.error("SMTP not configured in Backend/.env");
  process.exit(1);
}

const result = await sendShortlistNotification({
  to,
  studentName: "Test Student",
  jobTitle: "Software Engineer",
  companyName: "Arcon",
});

console.log(result);
process.exit(result.sent ? 0 : 1);
