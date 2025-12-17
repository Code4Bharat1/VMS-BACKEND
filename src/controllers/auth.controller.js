import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ---------------- REGISTER ADMIN ---------------- //
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if email exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
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

// ---------------- LOGIN ADMIN / STAFF ---------------- //
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid password" });

    // Create token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const supervisorOnly = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if email exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    } 
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "supervisor",
    });
    return res.json({
      message: "Supervisor registered successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
  }