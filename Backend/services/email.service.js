import nodemailer from "nodemailer";

let transporter;

function env(key) {
  const v = process.env[key];
  return typeof v === "string" ? v.trim() : v;
}

function getTransporter() {
  if (transporter) return transporter;
  const host = env("SMTP_HOST");
  const user = env("SMTP_USER");
  const pass = env("SMTP_PASS");
  if (!host || !user || !pass) return null;

  const port = Number(env("SMTP_PORT")) || 587;
  const secure = env("SMTP_SECURE") === "true";

  transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  });
  return transporter;
}

export function isSmtpConfigured() {
  return Boolean(env("SMTP_HOST") && env("SMTP_USER") && env("SMTP_PASS"));
}

/**
 * Sends shortlist notification. Returns { sent, reason?, error? }.
 */
export async function sendShortlistNotification({
  to,
  studentName,
  jobTitle,
  companyName,
}) {
  if (!to) return { sent: false, reason: "no-email" };

  const transport = getTransporter();
  const smtpUser = env("SMTP_USER");
  const from = env("MAIL_FROM") || smtpUser || "noreply@arconjobs.com";
  const frontendUrl = (env("FRONTEND_URL") || "http://localhost:5173").replace(
    /\/$/,
    ""
  );
  const profileUrl = `${frontendUrl}/Profile#applied-jobs`;

  const subject = `Shortlisted: ${jobTitle} at ${companyName}`;
  const text = `Hello ${studentName},

Great news! Your application for "${jobTitle}" at ${companyName} has been shortlisted by the recruiter.

Sign in to view your application status: ${profileUrl}

— Arcon Jobs`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
      <h2 style="color:#6B3AC2">You've been shortlisted</h2>
      <p>Hello <strong>${studentName}</strong>,</p>
      <p>Your application for <strong>${jobTitle}</strong> at <strong>${companyName}</strong> has been shortlisted by the recruiter.</p>
      <p><a href="${profileUrl}" style="display:inline-block;background:#6B3AC2;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">View Your Profile</a></p>
      <p style="font-size:12px;color:#64748b">Arcon Jobs</p>
    </div>
  `;

  if (!transport) {
    console.warn(
      "[Email] SMTP not configured in Backend/.env (SMTP_HOST, SMTP_USER, SMTP_PASS)"
    );
    return { sent: false, reason: "smtp-not-configured" };
  }

  try {
    await transport.verify();
    await transport.sendMail({ from, to, subject, text, html });
    console.log(`[Email] Shortlist notification sent to ${to}`);
    return { sent: true };
  } catch (err) {
    console.error("[Email] Send failed:", err.message);
    return { sent: false, reason: "send-failed", error: err.message };
  }
}
