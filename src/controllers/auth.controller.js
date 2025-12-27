// import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

// ---------------- REGISTER ADMIN ---------------- //
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

// ---------------- LOGIN ---------------- //
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;
    email = email.toLowerCase().trim();

    // const user = await User.findOne({ email });
    const user = await User.findOne({ email })
  .populate("managedBays", "_id bayName")
  .populate("assignedBay", "_id bayName");


    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "User is inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ---------------- CREATE SUPERVISOR ---------------- //
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

// ---------------- CREATE STAFF ---------------- //
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
