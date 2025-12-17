import express from "express";
import { loginUser, registerUser, supervisorOnly } from "../controllers/auth.controller.js";
import { protect, adminOnly } from "../middleware/auth.middleware.js";
import { get } from "mongoose";

const router = express.Router();

// LOGIN (public)
router.post("/login", loginUser);

// REGISTER (Admin only - secured)
router.post("/register", protect, adminOnly, registerUser);

// SUPERVISOR ONLY (Admin only - secured)
router.post("/supervisor", adminOnly,supervisorOnly);

export default router;
