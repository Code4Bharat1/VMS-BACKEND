import express from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// LOGIN (public)
router.post("/login", loginUser);

// REGISTER (Admin only - secured)
router.post("/register", protect, adminOnly, registerUser);

export default router;
