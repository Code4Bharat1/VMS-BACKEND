import express from "express";
import {
  rejectStaff,
  deleteStaff,
  approveStaff,
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
router.post("/", protect, createStaff);
router.get("/", protect, getAllStaff);
router.patch("/:id/approve", protect, adminOnly, approveStaff);
router.patch("/:id/reject", protect, adminOnly, rejectStaff);
router.patch("/:id/status", protect, toggleStaffStatus);
router.delete("/:id", protect, adminOnly, deleteStaff);

router.put("/:id", updateStaff);

// Supervisor-only
router.post("/assign-staff", protect, supervisorOnly, assignStaffToBay);

// ✅ ADD THIS LINE - Both admin and supervisor can toggle
router.patch("/:id/toggle-status", protect, toggleStaffStatus);

export default router;