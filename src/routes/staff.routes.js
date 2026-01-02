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
router.patch("/:id/status", protect, adminOnly, toggleStaffStatus);
router.delete("/:id", protect, adminOnly, deleteStaff);

router.put("/:id", protect, adminOnly, updateStaff);



// Supervisor-only
router.post("/assign-staff", protect, supervisorOnly, assignStaffToBay);

export default router;
