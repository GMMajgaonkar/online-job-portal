import { Job } from "../models/job.model.js";
import { User } from "../models/user.model.js";

/** Recruiter must own the job; Admin role allowed for platform admin routes separately */
const requireRecruiterJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId || req.params.id;
    if (!jobId) {
      return res.status(400).json({ message: "Job id required", success: false });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job not found", success: false });
    }

    const user = await User.findById(req.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }

    if (user.role === "Admin") {
      req.job = job;
      return next();
    }

    if (user.role !== "Recruiter" || String(job.created_by) !== String(req.id)) {
      return res.status(403).json({ message: "Access denied", success: false });
    }

    req.job = job;
    next();
  } catch (error) {
    res.status(500).json({ message: "Authorization error", success: false });
  }
};

export default requireRecruiterJob;
