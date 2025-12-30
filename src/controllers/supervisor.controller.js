import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { logActivity } from "../utils/ActivityLog.js";

// ---------------- CREATE SUPERVISOR ----------------
export const createSupervisor = async (req, res) => {
  try {
    const { name, email, phone, assignedBay, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const supervisor = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "supervisor",
      assignedBay,
    });


    await logActivity({
      req,
      action: "Supervisor Created",
      module: "AUTH",
      description: ` created staff ${supervisor.name}`,
    });

    return res.json({
      success: true,
      message: "Supervisor created successfully",
      supervisor,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- GET ALL SUPERVISORS ----------------
export const getAllSupervisors = async (req, res) => {
  try {
    const supervisorList = await User.find({ role: "supervisor" })
      .select("-password")
      .populate("assignedBay");

    return res.json({
      success: true,
      supervisors: supervisorList,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- UPDATE SUPERVISOR ----------------
export const updateSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    delete updates.password;
    delete updates.role;

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
    }).select("-password");

    if (!updated) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    return res.json({
      success: true,
      message: "Supervisor updated",
      updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- TOGGLE ACTIVE/INACTIVE ----------------
export const toggleSupervisorStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const supervisor = await User.findById(id);
    if (!supervisor) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    supervisor.isActive = !supervisor.isActive;
    await supervisor.save();

    return res.json({
      success: true,
      message: "Status updated",
      isActive: supervisor.isActive,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
