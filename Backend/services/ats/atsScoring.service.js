import stringSimilarity from "string-similarity";
import {
  compareSkillLists,
  extractSkillsFromText,
  normalizeToken,
  skillsMatch,
} from "./keywordMatcher.service.js";

const WEIGHTS = {
  skills: 0.4,
  experience: 0.25,
  jobTitle: 0.15,
  location: 0.1,
  education: 0.05,
  completeness: 0.05,
};

function jobRequiredSkills(job) {
  const fromReq = (job.requirements || []).flatMap((r) =>
    String(r)
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean)
  );
  const fromDesc = extractSkillsFromText(
    `${job.description} ${job.title} ${job.jobType}`
  );
  return [...new Set([...fromReq, ...fromDesc])].slice(0, 25);
}

function scoreSkills(resumeSkills, jobSkills) {
  if (!jobSkills.length) return { score: 70, matched: [], missing: [], strong: [] };
  const { matched, missing, strong } = compareSkillLists(resumeSkills, jobSkills);
  const score = Math.round((matched.length / jobSkills.length) * 100);
  return { score, matched, missing, strong };
}

function scoreExperience(parsed, job) {
  const required = Number(job.experienceLevel) || 0;
  const candidate = parsed.yearsOfExperience || 0;
  if (required === 0) return 80;
  if (candidate >= required) return 100;
  if (candidate >= required - 1) return 85;
  if (candidate >= required - 2) return 60;
  return Math.max(20, Math.round((candidate / required) * 100));
}

function scoreJobTitle(parsed, job) {
  const jobTitle = normalizeToken(job.title);
  const titles = (parsed.jobTitles || []).map(normalizeToken);
  if (!titles.length) {
    const raw = normalizeToken(parsed.rawText?.slice(0, 2000) || "");
    if (raw.includes(jobTitle.split(" ")[0])) return 60;
    return 30;
  }
  let best = 0;
  for (const t of titles) {
    best = Math.max(best, stringSimilarity.compareTwoStrings(t, jobTitle));
    if (skillsMatch(t, job.title)) best = Math.max(best, 0.9);
  }
  return Math.round(best * 100);
}

function scoreLocation(parsed, job) {
  const jobLoc = normalizeToken(job.location);
  if (!jobLoc || jobLoc === "remote") return 90;
  const locs = [
    ...(parsed.locations || []),
    normalizeToken(parsed.rawText?.slice(0, 1500)),
  ];
  const hit = locs.some((l) => l.includes(jobLoc) || jobLoc.includes(l));
  return hit ? 100 : 40;
}

function scoreEducation(parsed) {
  const count = parsed.education?.length || 0;
  if (count >= 2) return 100;
  if (count === 1) return 80;
  return 40;
}

function buildExperienceSummary(parsed) {
  const years = parsed.yearsOfExperience || 0;
  const titles = (parsed.jobTitles || []).slice(0, 2).join("; ");
  return `${years} year(s) experience${titles ? ` · ${titles}` : ""}`;
}

export function generateImprovementSuggestions(parsed, job, missingSkills) {
  const suggestions = [];
  if (missingSkills.length) {
    suggestions.push(
      `Add keywords to resume: ${missingSkills.slice(0, 5).join(", ")}`
    );
  }
  if (!parsed.projects?.length) {
    suggestions.push("Include a Projects section with measurable outcomes.");
  }
  if ((parsed.rawText?.length || 0) < 500) {
    suggestions.push("Resume text is short — expand descriptions and bullet points.");
  }
  if (parsed.completenessScore < 60) {
    suggestions.push("Improve formatting: clear sections for Skills, Experience, Education.");
  }
  const reqExp = Number(job.experienceLevel) || 0;
  if ((parsed.yearsOfExperience || 0) < reqExp) {
    suggestions.push(
      `Job requires ~${reqExp} year(s) experience — highlight relevant internships or projects.`
    );
  }
  return suggestions.slice(0, 6);
}

export function calculateAtsScore(parsed, job, userProfile = {}) {
  const jobSkills = jobRequiredSkills(job);
  const resumeSkills = [
    ...new Set([
      ...(parsed.skills || []),
      ...(userProfile.skills || []).map((s) => normalizeToken(s)),
    ]),
  ].filter(Boolean);

  const skillsResult = scoreSkills(resumeSkills, jobSkills);
  const experienceMatch = scoreExperience(parsed, job);
  const jobTitleMatch = scoreJobTitle(parsed, job);
  const locationMatch = scoreLocation(parsed, job);
  const educationMatch = scoreEducation(parsed);
  const completenessMatch = parsed.completenessScore || 50;

  const overallScore = Math.round(
    skillsResult.score * WEIGHTS.skills +
      experienceMatch * WEIGHTS.experience +
      jobTitleMatch * WEIGHTS.jobTitle +
      locationMatch * WEIGHTS.location +
      educationMatch * WEIGHTS.education +
      completenessMatch * WEIGHTS.completeness
  );

  const suggestions = generateImprovementSuggestions(
    parsed,
    job,
    skillsResult.missing
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    breakdown: {
      skillsMatch: skillsResult.score,
      experienceMatch,
      jobTitleMatch,
      locationMatch,
      educationMatch,
      completenessMatch,
    },
    matchedSkills: skillsResult.matched,
    missingSkills: skillsResult.missing,
    strongSkills: skillsResult.strong,
    experienceSummary: buildExperienceSummary(parsed),
    suggestions,
    keywordHits: skillsResult.matched,
  };
}

export { jobRequiredSkills };
