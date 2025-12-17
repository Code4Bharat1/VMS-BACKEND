import User from "../models/User.js";
import bcrypt from "bcryptjs";

// ---------------- CREATE STAFF ----------------
export const createStaff = async (req, res) => {
  try {
    const { name, email, phone, assignedBay, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "staff",
      assignedBay,
    });

    return res.json({
      success: true,
      message: "Staff created successfully",
      staff,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- GET ALL STAFF ----------------
export const getAllStaff = async (req, res) => {
  try {
    const staffList = await User.find({ role: "staff" }).select("-password");
    return res.json({ success: true, staff: staffList });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- UPDATE STAFF ----------------
export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    delete updates.password;

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ message: "Staff not found" });

    return res.json({ success: true, message: "Staff updated", updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- TOGGLE ACTIVE/INACTIVE ----------------
export const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    staff.isActive = !staff.isActive;
    await staff.save();

    return res.json({
      success: true,
      message: "Status updated",
      isActive: staff.isActive,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
