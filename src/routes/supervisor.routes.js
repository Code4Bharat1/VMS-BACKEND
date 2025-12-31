import express from "express";
import {
  createSupervisor,
  getAllSupervisors,
  updateSupervisor,
  toggleSupervisorStatus,
  deleteSupervisor
} from "../controllers/supervisor.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only access
router.post("/", protect, adminOnly, createSupervisor);
router.get("/", protect, adminOnly, getAllSupervisors);
router.put("/:id", protect, adminOnly, updateSupervisor);
router.patch("/:id/status", protect, adminOnly, toggleSupervisorStatus);
router.delete("/:id", protect, adminOnly, deleteSupervisor);


export default router;
