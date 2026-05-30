import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { AtsScore } from "../models/atsScore.model.js";
import { processApplicationAts } from "../services/ats/atsPipeline.service.js";
import { sendShortlistNotification } from "../services/email.service.js";

export const applyJob = async (req, res) => {
  try {
    const userId = req.id;
    const jobId = req.params.id;
    if (!jobId) {
      return res
        .status(400)
        .json({ message: "Invalid job id", success: false });
    }
    // check if the user already has applied for this job
    const existingApplication = await Application.findOne({
      job: jobId,
      applicant: userId,
    });
    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied for this job",
        success: false,
      });
    }
    //check if the job exists or not
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }
    // create a new application

    const newApplication = await Application.create({
      job: jobId,
      applicant: userId,
    });
    job.applications.push(newApplication._id);
    await job.save();

    const atsResult = await processApplicationAts(newApplication._id);

    return res.status(201).json({
      message: "Application submitted",
      success: true,
      applicationId: newApplication._id,
      ats: atsResult
        ? {
            overallScore: atsResult.result.overallScore,
            rank: atsResult.atsDoc.rank,
            matchedSkills: atsResult.result.matchedSkills,
            missingSkills: atsResult.result.missingSkills,
          }
        : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAppliedJobs = async (req, res) => {
  try {
    const userId = req.id;
    const applications = await Application.find({
      applicant: userId,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "job",
        populate: { path: "company" },
      });

    return res.status(200).json({
      application: applications,
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const getApplicants = async (req, res) => {
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).populate({
      path: "applications",
      options: { sort: { createdAt: -1 } },
      populate: { path: "applicant", options: { sort: { createdAt: -1 } } },
    });
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    return res.status(200).json({ job, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicationId = req.params.id;
    if (!status) {
      return res.status(400).json({
        message: "status is required",
        success: false,
      });
    }

    // find the application by applicantion id
    const application = await Application.findOne({ _id: applicationId });
    if (!application) {
      return res.status(404).json({
        message: "Application not found.",
        success: false,
      });
    }

    const normalized = status.toLowerCase();
    const allowed = ["pending", "shortlisted", "accepted", "rejected"];
    if (!allowed.includes(normalized)) {
      return res.status(400).json({
        message: `Invalid status. Use: ${allowed.join(", ")}`,
        success: false,
      });
    }

    const wasShortlisted = application.shortlisted;
    application.status = normalized;
    application.shortlisted = normalized === "shortlisted";
    await application.save();

    if (normalized === "shortlisted" && !wasShortlisted) {
      const populated = await Application.findById(applicationId)
        .populate({
          path: "job",
          populate: { path: "company", select: "name" },
        })
        .populate("applicant", "fullname email");
      if (populated?.applicant?.email) {
        try {
          await sendShortlistNotification({
            to: populated.applicant.email,
            studentName: populated.applicant.fullname || "Candidate",
            jobTitle: populated.job?.title || "the position",
            companyName: populated.job?.company?.name || "the company",
          });
        } catch (mailErr) {
          console.error("[Email] shortlist notification failed:", mailErr.message);
        }
      }
    }

    return res
      .status(200)
      .json({ message: "Application status updated", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};

// Student cancels their own pending application
export const cancelApplication = async (req, res) => {
  try {
    const userId = req.id;
    const applicationId = req.params.id;

    const application = await Application.findById(applicationId);
    if (!application) {
      return res
        .status(404)
        .json({ message: "Application not found", success: false });
    }

    // Only the applicant can cancel
    if (String(application.applicant) !== String(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized", success: false });
    }

    // Only pending applications can be cancelled
    if (application.status !== "pending") {
      return res.status(400).json({
        message: "Only pending applications can be cancelled",
        success: false,
      });
    }

    const jobId = application.job;

    // Remove the application reference from the job (restores availability)
    await Job.findByIdAndUpdate(jobId, {
      $pull: { applications: application._id },
    });

    // Remove linked ATS score if exists
    if (application.atsScoreId) {
      await AtsScore.findByIdAndDelete(application.atsScoreId).catch(() => {});
    }

    // Delete the application
    await Application.findByIdAndDelete(applicationId);

    return res.status(200).json({
      message: "Application cancelled successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
