import Entry from "../models/Entry.js";
import Vendor from "../models/Vendor.js";
import Bay from "../models/Bay.js";

export const manualEntry = async (req, res) => {
  try {
    const {
      visitorName,
      visitorMobile,
      visitorCompany,
      vehicleNumber,
      vehicleType,
      vendorId,
      bayId,
    } = req.body;

    const entry = await Entry.create({
      visitorName,
      visitorMobile,
      visitorCompany,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      vendorId,
      bayId,
      entryMethod: "manual",
      createdBy: req.user.id,
    });

    return res.json({ success: true, entry });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const checkReturningVehicle = async (req, res) => {
  try {
    const { vehicleNumber } = req.params;

    const lastEntry = await Entry.findOne({
      vehicleNumber: vehicleNumber.toUpperCase(),
    })
      .sort({ inTime: -1 })
      .limit(1);

    if (!lastEntry) {
      return res.json({ returning: false });
    }

    return res.json({ returning: true, lastEntry });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const exitEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Entry.findById(id);
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    entry.outTime = new Date();
    await entry.save();

    res.json({ success: true, message: "Vehicle exited", entry });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const searchEntries = async (req, res) => {
  try {
    const { vrn, mobile, company, from, to } = req.query;

    let filter = {};

    if (vrn) filter.vehicleNumber = { $regex: vrn, $options: "i" };
    if (mobile) filter.visitorMobile = { $regex: mobile, $options: "i" };
    if (company) filter.visitorCompany = { $regex: company, $options: "i" };

    if (from || to) {
      filter.inTime = {};
      if (from) filter.inTime.$gte = new Date(from);
      if (to) filter.inTime.$lte = new Date(to);
    }

    const entries = await Entry.find(filter)
      .populate("vendorId bayId createdBy")
      .sort({ createdAt: -1 });

    res.json({ success: true, entries });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllEntries = async (req, res) => {
  try {
    const entries = await Entry.find()
      .populate("vendorId bayId createdBy")
      .sort({ createdAt: -1 });

    res.json({ success: true, entries });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
