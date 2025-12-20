import express from "express";
import {
  manualEntry,
  checkReturningVehicle,
  exitEntry,
  searchEntries,
  getAllEntries,
} from "../controllers/entry.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Staff routes
router.post("/manual", manualEntry);

// Returning vehicle detection
router.get("/returning/:vehicleNumber", protect, checkReturningVehicle);

// Exit
router.patch("/:id/exit", protect, exitEntry);

// Search entries
router.get("/search", protect, searchEntries);

// Admin fetch all
router.get("/", getAllEntries);

export default router;
