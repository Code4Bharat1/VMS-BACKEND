import { User } from "../models/user.model.js";
import { Entry } from "../models/entry.model.js";  // 👈 ADD THIS LINE
import bcrypt from "bcryptjs";
import { logActivity } from "../utils/ActivityLog.js";

/* ================= CREATE SUPERVISOR ================= */
export const createSupervisor = async (req, res) => {
  try {
    const { name, email, phone, password, managedBays } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (!managedBays || managedBays.length === 0) {
      return res.status(400).json({
        message: "Supervisor must be assigned at least one bay",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const supervisor = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "supervisor",
      managedBays, // ✅ MULTI-BAY
    });

    await logActivity({
      req,
      action: "Supervisor Created",
      module: "SUPERVISOR",
      description: `Supervisor ${supervisor.name} created`,
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

/* ================= GET ALL SUPERVISORS ================= */
export const getAllSupervisors = async (req, res) => {
  try {
    const supervisors = await User.find({ role: "supervisor" })
      .select("-password")
      .populate("managedBays", "bayName"); // ✅ FIX

    return res.json({
      success: true,
      supervisors,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE SUPERVISOR ================= */
export const updateSupervisor = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, managedBays } = req.body;

    const updated = await User.findByIdAndUpdate(
      id,
      { name, email, phone, managedBays }, // ✅ SAFE UPDATE
      { new: true }
    )
      .select("-password")
      .populate("managedBays", "bayName");

    if (!updated) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    return res.json({
      success: true,
      message: "Supervisor updated successfully",
      supervisor: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/* ================= TOGGLE STATUS ================= */
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

/* ================= DELETE SUPERVISOR ================= */
export const deleteSupervisor = async (req, res) => {
  try {
    const { id } = req.params;

    const supervisor = await User.findById(id);
    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    // 🔐 Safety: block delete if staff exists in ANY managed bay
    const staffCount = await User.countDocuments({
      role: "staff",
      assignedBay: { $in: supervisor.managedBays },
    });

    if (staffCount > 0) {
      return res.status(400).json({
        message: "Cannot delete supervisor with assigned staff",
      });
    }

    await User.findByIdAndDelete(id);

    await logActivity({
      req,
      action: "Supervisor Deleted",
      module: "SUPERVISOR",
      description: `Supervisor ${supervisor.name} deleted`,
    });

    return res.json({
      success: true,
      message: "Supervisor deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- GET MY PROFILE ----------------
export const getMyProfile = async (req, res) => {
  try {
    const supervisorId = req.user.id;

    const user = await User.findById(supervisorId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ---------------- UPDATE MY PROFILE (FIXED) ----------------
export const updateMyProfile = async (req, res) => {
  try {
    const supervisorId = req.user.id; // ✅ SINGLE SOURCE OF TRUTH

    const { name, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      supervisorId,
      { name, email, phone },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Supervisor not found" });
    }

    return res.json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


// ---------------- GET SUPERVISOR STATS ----------------
export const getSupervisorStats = async (req, res) => {
  try {
    const supervisorId = req.user._id || req.user.id;
    const { period } = req.query;

    const supervisor = await User.findById(supervisorId)
      .populate("managedBays");

    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const bayIds = supervisor.managedBays?.map(b => b._id) || [];

    if (bayIds.length === 0) {
      return res.json({
        totalStaff: 0,
        todayEntries: 0,
        avgProcessingTime: "0s",
        activeBays: 0,
      });
    }

    /* ---------- DATE FILTER ---------- */
    let dateFilter = {};
    const now = new Date();

    if (period === "daily") {
      dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (period === "weekly") {
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (period === "monthly") {
      dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    }

    /* ---------- STAFF COUNT (ALL BAYS) ---------- */
    const totalStaff = await User.countDocuments({
      role: "staff",
      approvalStatus: "approved",
      assignedBay: { $in: bayIds },
    });

    /* ---------- ENTRIES (ALL BAYS) ---------- */
    const entries = await Entry.find({
      bayId: { $in: bayIds },
      inTime: dateFilter,
    });

    const todayEntries = entries.length;

    const avgTime =
      entries.length > 0
        ? Math.round(
            entries.reduce(
              (sum, e) => sum + (e.processingTimeMs || 0),
              0
            ) / entries.length / 1000
          )
        : 0;

    return res.json({
      totalStaff,
      todayEntries,
      avgProcessingTime: `${avgTime}s`,
      activeBays: bayIds.length,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



// ---------------- GET STAFF PERFORMANCE ----------------
export const getStaffPerformance = async (req, res) => {
  try {
    const supervisorId = req.user._id || req.user.id;
    const { period } = req.query;

    const supervisor = await User.findById(supervisorId)
      .populate("managedBays");

    if (!supervisor || supervisor.role !== "supervisor") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const bayIds = supervisor.managedBays?.map(b => b._id) || [];

    if (bayIds.length === 0) {
      return res.json({ staff: [] });
    }

    /* ---------- DATE FILTER ---------- */
    let dateFilter = {};
    const now = new Date();

    if (period === "daily") {
      dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
    } else if (period === "weekly") {
      dateFilter = { $gte: new Date(now.setDate(now.getDate() - 7)) };
    } else if (period === "monthly") {
      dateFilter = { $gte: new Date(now.setMonth(now.getMonth() - 1)) };
    }

    /* ---------- ALL STAFF FROM ALL MANAGED BAYS ---------- */
    const staffList = await User.find({
      role: "staff",
      approvalStatus: "approved",
      assignedBay: { $in: bayIds },
    }).select("name phone isActive");

    const staff = await Promise.all(
      staffList.map(async (s) => {
        const entries = await Entry.find({
          createdBy: s._id,
          inTime: dateFilter,
        });

        const avgTime =
          entries.length > 0
            ? Math.round(
                entries.reduce(
                  (sum, e) => sum + (e.processingTimeMs || 0),
                  0
                ) / entries.length / 1000
              )
            : 0;

        return {
          id: s._id,
          name: s.name,
          mobile: s.phone,
          entries: entries.length,
          avgTime: `${avgTime}s`,
          status: s.isActive ? "Active" : "Inactive",
        };
      })
    );

    return res.json({ staff });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};



// ---------------- GET RECENT UPDATES ----------------
export const getRecentUpdates = async (req, res) => {
  try {
    const supervisorId = req.user._id || req.user.id;

    // Get recent activities - you can customize this based on your ActivityLog model
    const updates = [
      { id: '1', time: 'Today • 09:20', action: 'Reviewed morning entries' },
      { id: '2', time: 'Today • 08:45', action: 'Staff assignment updated' },
      { id: '3', time: 'Yesterday • 18:10', action: 'Daily report completed' },
    ];

    return res.json({ updates });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};