import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { logActivity } from "../utils/ActivityLog.js";

// ---------------- CREATE STAFF ----------------
export const createStaff = async (req, res) => {
  try {
    const { name, email, phone, assignedBay, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
      createdBy: req.user._id,
    });

    const creatorName = req.user.name;
    const creatorRole = req.user.role === "admin" ? "Admin" : "Supervisor";

    await logActivity({
      req,
      action: "guard Created",
      module: "STAFF",
      description: `${creatorRole} ${creatorName} created Guard ${staff.name}`,
    });

    return res.json({
      success: true,
      message: isAdmin
        ? "guard created successfully"
        : "guard created and sent for admin approval",
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
      return res.status(404).json({ message: "guard not found" });
    }

    staff.approvalStatus = "approved";
    staff.isActive = true;
    await staff.save();

    await logActivity({
      req,
      action: "guard Approved",
      module: "STAFF",
      description: `Admin ${req.user.name} approved guard ${staff.name}`,
    });

    return res.json({
      success: true,
      message: "guard approved successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- GET ALL STAFF ----------------
export const getAllStaff = async (req, res) => {
  try {
    // ADMIN → see all staff
    if (req.user.role === "admin") {
      const staffList = await User.find({ role: "staff" })
        .select("-password")
        .populate("assignedBay", "bayName")
        .populate("createdBy", "name role");

      return res.json({ success: true, staff: staffList });
    }

    // SUPERVISOR → see staff in ALL managed bays
    if (req.user.role === "supervisor") {
      const supervisor = await User.findById(req.user._id).select("managedBays");

      const staffList = await User.find({
        role: "staff",
        assignedBay: { $in: supervisor.managedBays },
      })
        .select("-password")
        .populate("assignedBay", "bayName")
        .populate("createdBy", "name role");

      return res.json({ success: true, staff: staffList });
    }

    return res.status(403).json({ message: "Unauthorized" });
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

    if (!updated) return res.status(404).json({ message: "guard not found" });

    await logActivity({
      req,
      action: "guard Updated",
      module: "STAFF",
      description: `${req.user.role === "admin" ? "Admin" : "Supervisor"} ${req.user.name} updated guard ${updated.name}`,
    });

    return res.json({ success: true, message: "guard updated", updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- TOGGLE ACTIVE/INACTIVE ----------------
export const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const staff = await User.findById(id);
    if (!staff) return res.status(404).json({ message: "guard not found" });

    if (req.user.role === "supervisor") {
      const supervisor = await User.findById(userId).select("managedBays");

      const staffBayId =
        typeof staff.assignedBay === "string"
          ? staff.assignedBay
          : staff.assignedBay._id;

      const allowed = supervisor.managedBays.some(
        (b) => String(b) === String(staffBayId)
      );

      if (!allowed) {
        return res.status(403).json({ message: "guard not in your bays" });
      }

      if (staff.approvalStatus !== "approved") {
        return res.status(403).json({ message: "Cannot toggle pending guard" });
      }
    }

    staff.isActive = !staff.isActive;
    await staff.save();

    await logActivity({
      req,
      action: "guard Status Toggled",
      module: "STAFF",
      description: `${req.user.role === "admin" ? "Admin" : "Supervisor"} ${req.user.name} ${
        staff.isActive ? "activated" : "deactivated"
      } guard ${staff.name}`,
    });

    return res.json({
      success: true,
      message: "Status updated",
      isActive: staff.isActive,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- DELETE STAFF (ADMIN ONLY) ----------------
export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await User.findById(id);

    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "guard not found" });
    }

    await User.findByIdAndDelete(id);

    await logActivity({
      req,
      action: "guard Deleted",
      module: "STAFF",
      description: `Admin ${req.user.name} deleted guard ${staff.name}`,
    });

    return res.json({
      success: true,
      message: "guard deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- REJECT STAFF (ADMIN - SOFT REJECT) ----------------
export const rejectStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const staff = await User.findById(id);
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "guard not found" });
    }

    staff.approvalStatus = "rejected";
    staff.isActive = false;
    staff.rejectionReason = reason || "No reason provided";

    await staff.save();

    await logActivity({
      req,
      action: "guard Rejected",
      module: "STAFF",
      description: `Admin ${req.user.name} rejected guard ${staff.name}. Reason: ${staff.rejectionReason}`,
    });

    return res.json({
      success: true,
      message: "guard rejected successfully",
      staff,
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
      return res.status(404).json({ message: "guard not found" });
    }

    staff.assignedBay = bayId;
    await staff.save();

    await logActivity({
      req,
      action: "guard Assigned to Bay",
      module: "STAFF",
      description: `Supervisor ${supervisor.name} assigned guard ${staff.name} to bay`,
    });

    return res.json({
      success: true,
      message: "guard assigned to bay successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};