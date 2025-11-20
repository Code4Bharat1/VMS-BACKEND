import Bay from "../models/Bay.js";

// ---------------- CREATE BAY ----------------
export const createBay = async (req, res) => {
  try {
    const { bayName, bayType } = req.body;

    const exists = await Bay.findOne({ bayName });
    if (exists) {
      return res.status(400).json({ message: "Bay already exists" });
    }

    const bay = await Bay.create({ bayName, bayType });

    res.json({ success: true, message: "Bay created successfully", bay });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- GET ALL BAYS ----------------
export const getBays = async (req, res) => {
  try {
    const bays = await Bay.find().sort({ createdAt: -1 });
    res.json({ success: true, bays });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- UPDATE BAY ----------------
export const updateBay = async (req, res) => {
  try {
    const { id } = req.params;

    const bay = await Bay.findByIdAndUpdate(id, req.body, { new: true });

    if (!bay) return res.status(404).json({ message: "Bay not found" });

    res.json({ success: true, message: "Bay updated", bay });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- TOGGLE BAY STATUS ----------------
export const toggleBayStatus = async (req, res) => {
  try {
    const bay = await Bay.findById(req.params.id);

    if (!bay) return res.status(404).json({ message: "Bay not found" });

    bay.status = bay.status === "active" ? "inactive" : "active";
    await bay.save();

    res.json({
      success: true,
      message: "Status updated",
      status: bay.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- DELETE BAY ----------------
export const deleteBay = async (req, res) => {
  try {
    const bay = await Bay.findByIdAndDelete(req.params.id);

    if (!bay) return res.status(404).json({ message: "Bay not found" });

    res.json({ success: true, message: "Bay deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
