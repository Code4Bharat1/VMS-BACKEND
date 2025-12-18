import express from "express";
import {
  createSupervisor,
  getAllSupervisors,
  updateSupervisor,
  toggleSupervisorStatus,
} from "../controllers/supervisor.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only access
router.post("/", createSupervisor);
router.get("/", getAllSupervisors);
router.put("/:id", protect, adminOnly, updateSupervisor);
router.patch("/:id/status", protect, adminOnly, toggleSupervisorStatus);

export default router;
