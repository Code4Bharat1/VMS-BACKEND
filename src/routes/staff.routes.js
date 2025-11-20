import express from "express";
import {
  createStaff,
  getAllStaff,
  updateStaff,
  toggleStaffStatus,
} from "../controllers/staff.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only access
router.post("/", protect, adminOnly, createStaff);
router.get("/", protect, adminOnly, getAllStaff);
router.put("/:id", protect, adminOnly, updateStaff);
router.patch("/:id/status", protect, adminOnly, toggleStaffStatus);

export default router;
