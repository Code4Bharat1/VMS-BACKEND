import express from "express";
import {
  createSupervisor,
  getAllSupervisors,
  updateSupervisor,
  toggleSupervisorStatus,
  deleteSupervisor,
  updateMyProfile,
  getSupervisorStats, getStaffPerformance, getRecentUpdates,
  getMyProfile,       // 👈 ADD
} from "../controllers/supervisor.controller.js";

import { protect, adminOnly, supervisorOnly } from "../middleware/auth.middleware.js";

const router = express.Router();
// Add these routes (for supervisor only)

router.put("/profile", protect, supervisorOnly, updateMyProfile);
router.get("/profile", protect, supervisorOnly, getMyProfile);

// Admin-only
router.post("/", protect, adminOnly, createSupervisor);
router.get("/", protect, adminOnly, getAllSupervisors);
router.put("/:id", protect, adminOnly, updateSupervisor);
router.patch("/:id/status", protect, adminOnly, toggleSupervisorStatus);
router.delete("/:id", protect, adminOnly, deleteSupervisor);
router.get("/stats", protect, supervisorOnly, getSupervisorStats);
router.get("/staff", protect, supervisorOnly, getStaffPerformance);
router.get("/recent-updates", protect, supervisorOnly, getRecentUpdates);
// ✅ Supervisor self profile update
export default router;
