import express from "express";
import {
  createBay,
  getBays,
  updateBay,
  toggleBayStatus,
  deleteBay
} from "../controllers/bay.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Admin-only routes
router.post("/", protect, adminOnly, createBay);
router.get("/", protect, adminOnly, getBays);
router.put("/:id", protect, adminOnly, updateBay);
router.patch("/:id/status", protect, adminOnly, toggleBayStatus);
router.delete("/:id", protect, adminOnly, deleteBay);

export default router;
