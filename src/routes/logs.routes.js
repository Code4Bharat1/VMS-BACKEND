import express from "express";
import { getLogs, clearLogs } from "../controllers/logs.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getLogs);
router.delete("/clear",  clearLogs);

export default router;
