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
    
   const creatorName = req.user.name;
const creatorRole =
  req.user.role === "admin" ? "Admin" : "Supervisor";

await logActivity({
  req,
  action: "Staff Created",
  module: "STAFF",
  description: `${creatorRole} ${creatorName} created staff ${staff.name}`,
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

    if (!updated) return res.status(404).json({ message: "Staff not found" });

    return res.json({ success: true, message: "Staff updated", updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- TOGGLE ACTIVE/INACTIVE ----------------
// ---------------- TOGGLE ACTIVE/INACTIVE ----------------
export const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const staff = await User.findById(id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // If user is supervisor, verify staff is in their bay
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
    return res.status(403).json({ message: "Staff not in your bays" });
  }

  if (staff.approvalStatus !== "approved") {
    return res.status(403).json({ message: "Cannot toggle pending staff" });
  }
}


    staff.isActive = !staff.isActive;
    await staff.save();

    await logActivity({
      req,
      action: "Staff Status Toggled",
      module: "STAFF",
      description: `${req.user.role === "admin" ? "Admin" : "Supervisor"} ${
        staff.isActive ? "activated" : "deactivated"
      } staff ${staff.name}`,
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

    // 1️⃣ Find staff user
    const staff = await User.findById(id);

    // 2️⃣ Validate existence and role
    if (!staff || staff.role !== "staff") {
      return res.status(404).json({ message: "Staff not found" });
    }

    // 3️⃣ Delete staff
    await User.findByIdAndDelete(id);

    // 4️⃣ Log activity
    await logActivity({
      req,
      action: "Staff Deleted",
      module: "STAFF",
      description: `Admin deleted staff ${staff.name}`,
    });

    // 5️⃣ Send response
    return res.json({
      success: true,
      message: "Staff deleted successfully",
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
      return res.status(404).json({ message: "Staff not found" });
    }

    staff.approvalStatus = "rejected";
    staff.isActive = false;
    staff.rejectionReason = reason || "No reason provided";

    await staff.save();

    await logActivity({
      req,
      action: "Staff Rejected",
      module: "STAFF",
      description: `Admin rejected staff ${staff.name}. Reason: ${staff.rejectionReason}`,
    });

    return res.json({
      success: true,
      message: "Staff rejected successfully",
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
