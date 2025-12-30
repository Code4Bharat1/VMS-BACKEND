import ActivityLog from "../models/activityLog.model.js";

export const getLogs = async (req, res) => {
  try {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const query = {};

    // Supervisor → filter by role only (no managedBays from JWT)
    if (req.user.role === "supervisor") {
      query.actorRole = "supervisor";
    }

    // Staff → only own actions
    if (req.user.role === "staff") {
      query.actor = req.user.id;
    }

    const logs = await ActivityLog.find(query)
      .populate("actor", "name role") // safe
      .populate("bay", "name")
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, logs });
  } catch (err) {
    console.error("GET LOGS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch logs",
    });
  }
};

export const clearLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ success: true, message: "All logs cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to clear logs" });
  }
};
