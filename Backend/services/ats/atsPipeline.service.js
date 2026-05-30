import { Application } from "../../models/application.model.js";
import { Job } from "../../models/job.model.js";
import { User } from "../../models/user.model.js";
import { AtsScore } from "../../models/atsScore.model.js";
import { getOrParseResume } from "./resumeParser.service.js";
import { calculateAtsScore } from "./atsScoring.service.js";

export async function scoreApplication(applicationId) {
  const application = await Application.findById(applicationId);
  if (!application) throw new Error("Application not found");

  const [job, applicant] = await Promise.all([
    Job.findById(application.job),
    User.findById(application.applicant),
  ]);
  if (!job) throw new Error("Job not found");
  if (!applicant) throw new Error("Applicant not found");

  const parsed = await getOrParseResume(applicant._id);
  if (!parsed) throw new Error("Could not parse applicant resume");

  const result = calculateAtsScore(parsed, job, {
    skills: applicant.profile?.skills || [],
  });

  const atsDoc = await AtsScore.findOneAndUpdate(
    { application: applicationId },
    {
      application: applicationId,
      job: job._id,
      applicant: applicant._id,
      parsedResume: parsed._id,
      overallScore: result.overallScore,
      breakdown: result.breakdown,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      strongSkills: result.strongSkills,
      experienceSummary: result.experienceSummary,
      suggestions: result.suggestions,
      keywordHits: result.keywordHits,
    },
    { upsert: true, new: true }
  );

  application.atsScoreId = atsDoc._id;
  application.atsOverallScore = result.overallScore;
  await application.save();

  await recalculateRanksForJob(job._id);

  return { atsDoc, result };
}

export async function recalculateRanksForJob(jobId) {
  const scores = await AtsScore.find({ job: jobId }).sort({
    overallScore: -1,
    createdAt: 1,
  });

  let rank = 1;
  for (const s of scores) {
    s.rank = rank++;
    await s.save();
    await Application.findByIdAndUpdate(s.application, {
      atsRank: s.rank,
      atsOverallScore: s.overallScore,
      atsScoreId: s._id,
    });
  }
}

export async function analyzeJobCompatibility(userId, jobId) {
  const [job, user] = await Promise.all([
    Job.findById(jobId),
    User.findById(userId),
  ]);
  if (!job) throw new Error("Job not found");
  if (!user) throw new Error("User not found");

  const parsed = await getOrParseResume(userId);
  if (!parsed) {
    return {
      overallScore: 0,
      breakdown: {},
      matchedSkills: [],
      missingSkills: [],
      strongSkills: [],
      experienceSummary: "",
      suggestions: ["Upload a resume on your Profile page first."],
      parsed: false,
    };
  }

  return {
    ...calculateAtsScore(parsed, job, { skills: user.profile?.skills || [] }),
    parsed: true,
  };
}

export async function processApplicationAts(applicationId) {
  try {
    return await scoreApplication(applicationId);
  } catch (err) {
    console.error("[ATS] scoreApplication failed:", err.message);
    return null;
  }
}
