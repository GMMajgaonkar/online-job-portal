import express from "express";
import requireAdmin from "../middleware/requireAdmin.js";
import {
  adminSignIn,
  getDashboard,
  getAllUsers,
  createUserAdmin,
  updateUserAdmin,
  resetUserPasswordAdmin,
  deleteUser,
  updateUserRole,
  getAllCompaniesAdmin,
  createCompanyAdmin,
  updateCompanyAdmin,
  deleteCompanyAdmin,
  getAllJobsAdmin,
  createJobAdmin,
  updateJobAdmin,
  deleteJobAdmin,
  getAllApplicationsAdmin,
  updateApplicationStatusAdmin,
  deleteApplicationAdmin,
  listReports,
  getReport,
} from "../controllers/platformAdmin.controller.js";

const router = express.Router();

router.post("/sign-in", adminSignIn);
router.use(requireAdmin);

router.get("/dashboard", getDashboard);
router.get("/users", getAllUsers);
router.post("/users", createUserAdmin);
router.patch("/users/:id", updateUserAdmin);
router.patch("/users/:id/password", resetUserPasswordAdmin);
router.delete("/users/:id", deleteUser);
router.patch("/users/:id/role", updateUserRole);
router.get("/companies", getAllCompaniesAdmin);
router.post("/companies", createCompanyAdmin);
router.patch("/companies/:id", updateCompanyAdmin);
router.delete("/companies/:id", deleteCompanyAdmin);
router.get("/jobs", getAllJobsAdmin);
router.post("/jobs", createJobAdmin);
router.patch("/jobs/:id", updateJobAdmin);
router.delete("/jobs/:id", deleteJobAdmin);
router.get("/applications", getAllApplicationsAdmin);
router.patch("/applications/:id/status", updateApplicationStatusAdmin);
router.delete("/applications/:id", deleteApplicationAdmin);
router.get("/reports", listReports);
router.get("/reports/:reportId", getReport);

export default router;
