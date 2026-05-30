import express from "express";
import {
  getCurrentUser,
  login,
  logout,
  register,
  updateProfile,
} from "../controllers/user.controller.js";
import authenticateToken from "../middleware/isAuthenticated.js";
import {
  singleUploadProfile,
  singleUploadResume,
} from "../middleware/multer.js";

const router = express.Router();

router.route("/register").post(singleUploadProfile, register);
router.route("/login").post(login);
router.route("/logout").post(logout);
router.route("/me").get(authenticateToken, getCurrentUser);
router
  .route("/profile/update")
  .post(authenticateToken, singleUploadResume, updateProfile);

export default router;
