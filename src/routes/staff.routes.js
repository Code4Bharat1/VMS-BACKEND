import express from "express";
import {
  rejectStaff,
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
router.post("/", createStaff);
router.get("/", getAllStaff);
router.patch("/:id/approve", adminOnly, approveStaff);
router.patch("/:id/reject", adminOnly, rejectStaff);
router.patch("/:id/status", adminOnly, toggleStaffStatus);

router.patch("/:id", protect, adminOnly, updateStaff);



// Supervisor-only
router.post("/assign-staff", protect, supervisorOnly, assignStaffToBay);

export default router;
