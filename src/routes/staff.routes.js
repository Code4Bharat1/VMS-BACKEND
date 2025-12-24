import express from "express";
import {
  createStaff,
  getAllStaff,
  updateStaff,
  toggleStaffStatus,
  assignStaffToBay,
} from "../controllers/staff.controller.js";

import {
  protect,
  adminOnly,
  supervisorOnly,
} from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only
router.post("/", protect, adminOnly, createStaff);
router.get("/", protect, adminOnly, getAllStaff);
router.put("/:id", protect, adminOnly, updateStaff);
router.patch("/:id/status", protect, adminOnly, toggleStaffStatus);

// Supervisor-only
router.post("/assign-staff", protect, supervisorOnly, assignStaffToBay);

export default router;
