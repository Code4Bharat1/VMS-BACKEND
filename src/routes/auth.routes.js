import express from "express";
import {
  createStaff,
  createSupervisor,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updatePassword,
  updateProfile,
} from "../controllers/auth.controller.js";
import { generateCaptcha } from "../utils/captcha.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();


// Public
router.post("/login", loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

router.get("/captcha", (req, res) => {
  const captcha = generateCaptcha();
  res.json(captcha);
});
// Admin only
router.post("/register", protect, adminOnly, registerUser);
router.post("/supervisor", protect, adminOnly, createSupervisor);
router.post("/staff", protect, adminOnly, createStaff);
router.put("/users/update-password", protect, updatePassword);
router.put(
  "/users/profile",
  protect,
  updateProfile
);


export default router;
