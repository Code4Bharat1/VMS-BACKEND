import { User } from "../models/user.model.js";
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

    // 🔐 Detect who is creating staff
    const isAdmin = req.user.role === "admin";

    const staff = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "staff",
      assignedBay,
      approvalStatus: isAdmin ? "approved" : "pending",
      isActive: isAdmin ? true : false,

      requestSource: isAdmin ? "admin" : "supervisor",
      createdBy: req.user._id, // keep this for reference
    });

    return res.json({
      success: true,
      message: isAdmin
        ? "Staff created successfully"
        : "Staff created and sent for admin approval",
      staff,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- APPROVE STAFF (ADMIN ONLY) ----------------
export const approveStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.approvalStatus = "approved";
    staff.isActive = true;
    await staff.save();

    return res.json({
      success: true,
      message: "Staff approved successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- GET ALL STAFF ----------------
export const getAllStaff = async (req, res) => {
  try {
    const staffList = await User.find({ role: "staff" })
      .select("-password")
      .populate("assignedBay")
      // .populate("createdBy", "name email")
      .populate({
        path: "createdBy",
        select: "name role",
        options: { strictPopulate: false },
      });
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
// ---------------- REJECT STAFF (ADMIN - HARD DELETE) ----------------
export const rejectStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }

    await User.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: "Staff request rejected and removed",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- SUPERVISOR ASSIGNS STAFF TO BAY ----------------
export const assignStaffToBay = async (req, res) => {
  try {
    const supervisorId = req.user.id;
    const { staffId, bayId } = req.body;

    const supervisor = await User.findById(supervisorId);
    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (!supervisor.managedBays || !supervisor.managedBays.includes(bayId)) {
      return res.status(403).json({
        message: "Bay not under your supervision",
      });
    }

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.assignedBay = bayId;
    await staff.save();

    return res.json({
      success: true,
      message: "Staff assigned to bay successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
