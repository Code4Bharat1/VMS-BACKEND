import express from "express";
import {
  createSupervisor,
  getAllSupervisors,
  updateSupervisor,
  toggleSupervisorStatus,
  deleteSupervisor,
  updateMyProfile,          // 👈 ADD
} from "../controllers/supervisor.controller.js";

import { protect, adminOnly, supervisorOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only
router.post("/", protect, adminOnly, createSupervisor);
router.get("/", protect, adminOnly, getAllSupervisors);
router.put("/:id", protect, adminOnly, updateSupervisor);
router.patch("/:id/status", protect, adminOnly, toggleSupervisorStatus);
router.delete("/:id", protect, adminOnly, deleteSupervisor);

// ✅ Supervisor self profile update
router.post("/profile", protect, supervisorOnly, updateMyProfile);

export default router;
