import express from "express";
import { scanOCR } from "../controllers/ocr.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/scan", protect, scanOCR);

export default router;
