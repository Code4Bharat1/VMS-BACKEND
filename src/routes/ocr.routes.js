import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { scanPlateOCR } from "../controllers/ocr.controller.js";

const router = express.Router();

router.post("/scan", scanPlateOCR);

export default router;
