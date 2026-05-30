import express from "express";
import authenticateToken from "../middleware/isAuthenticated.js";
import requireRecruiterJob from "../middleware/requireRecruiterJob.js";
import {
  analyzeBeforeApply,
  getAtsScoreByApplication,
  getRankedApplicants,
  parseMyResume,
  rescoreAllForJob,
  rescoreApplication,
  toggleShortlist,
} from "../controllers/ats.controller.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/parse-resume", parseMyResume);
router.get("/analyze/:jobId", analyzeBeforeApply);
router.get("/score/application/:applicationId", getAtsScoreByApplication);

router.get("/job/:jobId/ranked", requireRecruiterJob, getRankedApplicants);
router.post("/job/:jobId/rescore-all", requireRecruiterJob, rescoreAllForJob);
router.post("/rescore/:applicationId", rescoreApplication);
router.patch("/shortlist/:applicationId", toggleShortlist);

export default router;
