/**
 * All API URLs come from VITE_API_BASE_URL in .env files (see .env.example).
 * Local: .env.development or .env.local
 * Vercel: Project Settings → Environment Variables
 */

const raw = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export const API_BASE = raw.replace(/\/$/, "");

if (!API_BASE) {
  console.error(
    "[Job Portal] VITE_API_BASE_URL is missing. Copy .env.example to .env.local or set it on Vercel."
  );
}

export const USER_API_ENDPOINT = `${API_BASE}/api/user`;
export const JOB_API_ENDPOINT = `${API_BASE}/api/job`;
export const APPLICATION_API_ENDPOINT = `${API_BASE}/api/application`;
export const COMPANY_API_ENDPOINT = `${API_BASE}/api/company`;
export const PLATFORM_ADMIN_API_ENDPOINT = `${API_BASE}/api/platform-admin`;
export const ATS_API_ENDPOINT = `${API_BASE}/api/ats`;
