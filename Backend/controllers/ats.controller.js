import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { AtsScore } from "../models/atsScore.model.js";
import { ParsedResume } from "../models/parsedResume.model.js";
import { User } from "../models/user.model.js";
import { parseResumeForUser } from "../services/ats/resumeParser.service.js";
import {
  analyzeJobCompatibility,
  processApplicationAts,
  recalculateRanksForJob,
  scoreApplication,
} from "../services/ats/atsPipeline.service.js";
import { booleanSearchMatch } from "../services/ats/keywordMatcher.service.js";
import { sendShortlistNotification } from "../services/email.service.js";

export const parseMyResume = async (req, res) => {
  try {
    const parsed = await parseResumeForUser(req.id);
    res.status(200).json({ success: true, parsed });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const analyzeBeforeApply = async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await analyzeJobCompatibility(req.id, jobId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getRankedApplicants = async (req, res) => {
  try {
    const jobId = req.params.jobId || req.params.id;
    const {
      minScore = 0,
      skill,
      search,
      booleanQuery,
      shortlisted,
      status,
    } = req.query;

    const applications = await Application.find({ job: jobId })
      .populate("applicant", "fullname email phoneNumber profile role")
      .lean();

    const scores = await AtsScore.find({ job: jobId }).lean();
    const scoreMap = new Map(scores.map((s) => [String(s.application), s]));

    let ranked = applications.map((app) => {
      const ats = scoreMap.get(String(app._id));
      return {
        applicationId: app._id,
        status: app.status,
        shortlisted: app.shortlisted,
        applicant: app.applicant,
        ats: ats
          ? {
              overallScore: ats.overallScore,
              rank: ats.rank,
              breakdown: ats.breakdown,
              matchedSkills: ats.matchedSkills,
              missingSkills: ats.missingSkills,
              strongSkills: ats.strongSkills,
              experienceSummary: ats.experienceSummary,
            }
          : {
              overallScore: app.atsOverallScore ?? 0,
              rank: app.atsRank ?? 9999,
              breakdown: {},
              matchedSkills: [],
              missingSkills: [],
              strongSkills: [],
              experienceSummary: "ATS pending",
            },
      };
    });

    ranked.sort(
      (a, b) =>
        (b.ats.overallScore || 0) - (a.ats.overallScore || 0) ||
        (a.ats.rank || 9999) - (b.ats.rank || 9999)
    );

    if (minScore) {
      ranked = ranked.filter((r) => (r.ats.overallScore || 0) >= Number(minScore));
    }
    if (status) {
      ranked = ranked.filter((r) => r.status === status);
    }
    if (shortlisted === "true") {
      ranked = ranked.filter((r) => r.shortlisted);
    }
    if (skill) {
      const sk = skill.toLowerCase();
      ranked = ranked.filter((r) =>
        r.ats.matchedSkills?.some((m) => m.toLowerCase().includes(sk))
      );
    }
    if (search) {
      const q = search.toLowerCase();
      ranked = ranked.filter(
        (r) =>
          r.applicant?.fullname?.toLowerCase().includes(q) ||
          r.applicant?.email?.toLowerCase().includes(q)
      );
    }
    if (booleanQuery) {
      ranked = ranked.filter((r) => {
        const skills = [
          ...(r.ats.matchedSkills || []),
          ...(r.ats.strongSkills || []),
          ...(r.applicant?.profile?.skills || []),
        ];
        const text = r.applicant?.profile?.bio || "";
        return booleanSearchMatch(booleanQuery, text, skills);
      });
    }

    res.status(200).json({
      success: true,
      jobId,
      total: ranked.length,
      applicants: ranked,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to load ranked applicants" });
  }
};

export const rescoreApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const result = await scoreApplication(applicationId);
    res.status(200).json({ success: true, ats: result.atsDoc, result: result.result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const toggleShortlist = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const app = await Application.findById(applicationId)
      .populate({
        path: "job",
        populate: { path: "company", select: "name" },
      })
      .populate("applicant", "fullname email");
    if (!app) {
      return res.status(404).json({ message: "Application not found", success: false });
    }

    const nowShortlisted = !app.shortlisted;
    app.shortlisted = nowShortlisted;
    app.status = nowShortlisted ? "shortlisted" : "pending";
    await app.save();
    await AtsScore.findOneAndUpdate(
      { application: applicationId },
      { shortlisted: app.shortlisted }
    );

    let emailResult = { sent: false };
    if (nowShortlisted && app.applicant?.email) {
      try {
        emailResult = await sendShortlistNotification({
          to: app.applicant.email,
          studentName: app.applicant.fullname || "Candidate",
          jobTitle: app.job?.title || "the position",
          companyName: app.job?.company?.name || "the company",
        });
      } catch (mailErr) {
        console.error("[Email] shortlist notification failed:", mailErr.message);
        emailResult = { sent: false, reason: "send-failed", error: mailErr.message };
      }
    }

    res.status(200).json({
      success: true,
      shortlisted: app.shortlisted,
      status: app.status,
      emailSent: emailResult.sent === true,
      emailReason: emailResult.reason || null,
      emailError: emailResult.error || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Shortlist update failed" });
  }
};

export const rescoreAllForJob = async (req, res) => {
  try {
    const jobId = req.params.jobId || req.params.id;
    const apps = await Application.find({ job: jobId });
    for (const app of apps) {
      await processApplicationAts(app._id);
    }
    await recalculateRanksForJob(jobId);
    res.status(200).json({
      success: true,
      message: `Rescored ${apps.length} applications`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAtsScoreByApplication = async (req, res) => {
  try {
    const ats = await AtsScore.findOne({
      application: req.params.applicationId,
    }).populate("parsedResume");
    if (!ats) {
      return res.status(404).json({ message: "ATS score not found", success: false });
    }
    res.status(200).json({ success: true, ats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
