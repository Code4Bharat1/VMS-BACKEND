//auth controller
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { verifyCaptcha } from "../utils/captcha.js";

const loginAttempts = new Map();


/* ---------------- REGISTER ADMIN ---------------- */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "admin",
    });

    return res.json({
      message: "Admin registered successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------- LOGIN ---------------- */
export const loginUser = async (req, res) => {
  try {
    let { email, password, captchaId, captchaValue } = req.body;
    email = email.toLowerCase().trim();
    const ip = req.ip;

    /* =========================
       COUNT ATTEMPTS
       ========================= */
    const attempts = (loginAttempts.get(ip) || 0) + 1;
    loginAttempts.set(ip, attempts);

    setTimeout(() => loginAttempts.delete(ip), 15 * 60 * 1000);

    

    /* =========================
       USER LOOKUP
       ========================= */
    const user = await User.findOne({ email })
      .populate("managedBays", "_id bayName")
      .populate("assignedBay", "_id bayName");

    /* =========================
       INVALID EMAIL
       ========================= */
    if (!user) {
      return res.status(400).json({
        message: "Email not found",
        requireCaptcha: attempts >= 3,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "User is inactive",
        requireCaptcha: attempts >= 3,
      });
    }

    /* =========================
       INVALID PASSWORD
       ========================= */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
        requireCaptcha: attempts >= 3,
      });
    }

    /* =========================
       CAPTCHA ENFORCEMENT (AFTER CHECKS)
       ========================= */
    if (attempts >= 3) {
      if (!captchaId || !captchaValue) {
        return res.status(400).json({
          message: "Captcha required",
          requireCaptcha: true,
        });
      }

      const isCaptchaValid = verifyCaptcha(captchaId, captchaValue);
      if (!isCaptchaValid) {
        return res.status(400).json({
          message: "Invalid captcha",
          requireCaptcha: true,
        });
      }
    }

    /* =========================
       SUCCESS
       ========================= */
    loginAttempts.delete(ip);

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      accessToken,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


/* ---------------- REFRESH TOKEN ---------------- */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken(user);

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    return res
      .status(403)
      .json({ message: "Invalid or expired refresh token" });
  }
};

/* ---------------- LOGOUT ---------------- */
export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    // ✅ CLEAR COOKIE
    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "strict",
    });

    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------- CREATE SUPERVISOR ---------------- */
export const createSupervisor = async (req, res) => {
  try {
    const { name, email, password, managedBays } = req.body;

    if (!managedBays || managedBays.length === 0) {
      return res.status(400).json({
        message: "Supervisor must be assigned at least one bay",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const supervisor = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "supervisor",
      managedBays,
    });

    return res.json({
      message: "Supervisor registered successfully",
      supervisor,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/* ---------------- CREATE STAFF ---------------- */
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, assignedBay } = req.body;

    if (!assignedBay) {
      return res.status(400).json({
        message: "Staff must be assigned to a bay",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "staff",
      assignedBay,
    });

    return res.json({
      message: "Staff registered successfully",
      staff,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
/* ---------------- UPDATE PASSWORD ---------------- */
export const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
/* ---------------- UPDATE PROFILE ---------------- */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body; // ✅ include phone

    if (!name || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailExists = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: userId },
    });

    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, email: normalizedEmail, phone }, // ✅ SAVE phone
      { new: true }
    );

    return res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

