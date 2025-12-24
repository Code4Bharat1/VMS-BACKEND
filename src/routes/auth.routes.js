import express from "express";
import {
  createStaff,
  createSupervisor,
  loginUser,
  registerUser,
} from "../controllers/auth.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public
router.post("/login", loginUser);

// Admin only
router.post("/register", protect, adminOnly, registerUser);
router.post("/supervisor", protect, adminOnly, createSupervisor);
router.post("/staff", protect, adminOnly, createStaff);

export default router;
