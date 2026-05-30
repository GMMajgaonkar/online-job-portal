import fs from "fs";
import path from "path";
import { createRequire } from "module";
import mammoth from "mammoth";
import { ParsedResume } from "../../models/parsedResume.model.js";
import { SkillIndex } from "../../models/skillIndex.model.js";
import { User } from "../../models/user.model.js";
import { resumeUrlToAbsolutePath } from "../../utils/resumePath.js";
import { extractSkillsFromText, normalizeToken } from "./keywordMatcher.service.js";

const require = createRequire(import.meta.url);
const pdfModule = require("pdf-parse");
/** pdf-parse@1.x exports a function; v2+ exports PDFParse class — support both */
const pdfParse =
  typeof pdfModule === "function"
    ? pdfModule
    : typeof pdfModule?.default === "function"
      ? pdfModule.default
      : null;

const EDUCATION_KEYWORDS = ["b.tech", "b.e", "m.tech", "mba", "bachelor", "master", "phd", "diploma", "university", "college", "institute"];
const EXP_PATTERNS = [/(\d+)\+?\s*years?/gi, /experience[:\s]*(\d+)/gi];

function extractYearsOfExperience(text) {
  let max = 0;
  for (const pattern of EXP_PATTERNS) {
    const matches = text.matchAll(pattern);
    for (const m of matches) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) max = Math.max(max, n);
    }
  }
  return max;
}

function extractSections(text) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  const education = [];
  const projects = [];
  const certifications = [];
  const jobTitles = [];
  const locations = [];
  const experience = [];

  for (const line of lines) {
    const low = line.toLowerCase();
    if (EDUCATION_KEYWORDS.some((k) => low.includes(k))) {
      education.push({ degree: line.slice(0, 120), institution: "", year: "" });
    }
    if (low.includes("certified") || low.includes("certification")) {
      certifications.push(line.slice(0, 120));
    }
    if (low.includes("project")) {
      projects.push(line.slice(0, 200));
    }
    if (
      /\b(developer|engineer|analyst|manager|intern|consultant|designer)\b/i.test(
        line
      ) &&
      line.length < 80
    ) {
      jobTitles.push(line);
    }
    if (/\b(india|pune|mumbai|delhi|bangalore|hyderabad|remote)\b/i.test(low)) {
      locations.push(line.match(/\b[A-Za-z\s,]+/i)?.[0]?.trim() || line);
    }
  }

  return {
    education: education.slice(0, 5),
    projects: projects.slice(0, 8),
    certifications: certifications.slice(0, 6),
    jobTitles: [...new Set(jobTitles)].slice(0, 6),
    locations: [...new Set(locations)].slice(0, 4),
    experience,
  };
}

function computeCompleteness(parsed) {
  let score = 0;
  if (parsed.skills?.length) score += 25;
  if (parsed.education?.length) score += 15;
  if (parsed.experience?.length || parsed.yearsOfExperience > 0) score += 25;
  if (parsed.projects?.length) score += 15;
  if (parsed.certifications?.length) score += 10;
  if (parsed.rawText?.length > 400) score += 10;
  return Math.min(100, score);
}

async function extractTextFromPdf(buffer) {
  if (!pdfParse) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result?.text || "";
    } finally {
      await parser.destroy();
    }
  }
  const data = await pdfParse(buffer);
  return data?.text || "";
}

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    return extractTextFromPdf(buffer);
  }
  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value || "";
  }
  if (ext === ".txt") {
    return fs.readFileSync(filePath, "utf8");
  }
  throw new Error(`Unsupported resume format: ${ext}. Use PDF or DOCX.`);
}

export async function parseResumeForUser(userId, options = {}) {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const resumeUrl = user.profile?.resume;
  if (!resumeUrl) throw new Error("No resume uploaded on profile");

  const filePath = resumeUrlToAbsolutePath(resumeUrl);
  if (!filePath) throw new Error("Resume file not found on server");

  const rawText = await extractTextFromFile(filePath);
  const profileSkills = user.profile?.skills || [];
  const skills = extractSkillsFromText(rawText, profileSkills);
  const sections = extractSections(rawText);
  const yearsOfExperience = extractYearsOfExperience(rawText);

  const parsed = {
    user: userId,
    resumeUrl,
    resumeFileName: user.profile?.resumeOriginalname || path.basename(filePath),
    rawText: rawText.slice(0, 50000),
    skills,
    ...sections,
    yearsOfExperience,
    completenessScore: 0,
    parsedAt: new Date(),
  };
  parsed.completenessScore = computeCompleteness(parsed);

  let doc = await ParsedResume.findOne({ user: userId, resumeUrl });
  if (doc) {
    Object.assign(doc, parsed);
    await doc.save();
  } else {
    doc = await ParsedResume.create(parsed);
  }

  const normalizedSkills = skills.map((s) => normalizeToken(s));
  await SkillIndex.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      skills,
      normalizedSkills,
      jobTitles: sections.jobTitles,
      locations: sections.locations,
      lastParsedResume: doc._id,
    },
    { upsert: true, new: true }
  );

  return doc;
}

export async function getOrParseResume(userId) {
  const user = await User.findById(userId);
  if (!user?.profile?.resume) return null;

  let parsed = await ParsedResume.findOne({ user: userId }).sort({ parsedAt: -1 });
  if (parsed && parsed.resumeUrl === user.profile.resume) {
    return parsed;
  }
  return parseResumeForUser(userId);
}
