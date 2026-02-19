import { Vendor } from "../models/vendor.model.js";
import { logActivity } from "../utils/ActivityLog.js";

// ---------------- CREATE VENDOR ----------------
export const createVendor = async (req, res) => {
  try {
    let { companyName, contactPerson, mobile, shopId, Category, floorNo, crNo } = req.body;

    // Normalize category manually (extra safety)
    Category = Category.trim().toLowerCase();

    const exists = await Vendor.findOne({
      mobile,
      shopId,
    });

    if (exists) {
      return res.status(400).json({ message: "Vendor already exists" });
    }

    const vendor = await Vendor.create({
      companyName,
      contactPerson,
      mobile,
      shopId,
      Category,
      floorNo,
      crNo,
    });

    await logActivity({
      req,
      action: "Vendor Created",
      module: "VENDOR",
      description: `${req.user?.name || "Admin"} created vendor ${vendor.companyName} (Shop: ${vendor.shopId})`,
    });

    res.json({ success: true, message: "Vendor created", vendor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- GET UNIQUE CATEGORIES ----------------
export const getVendorCategories = async (req, res) => {
  try {
    const categories = await Vendor.distinct("Category");

    res.json({
      success: true,
      categories: categories.sort(),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- GET ALL VENDORS ----------------
export const getVendors = async (req, res) => {
  try {
    const { search, status } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        { companyName: { $regex: search, $options: "i" } },
        { contactPerson: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
        { shopId: { $regex: search, $options: "i" } },
        { Category: { $regex: search, $options: "i" } },
        { floorNo: { $regex: search, $options: "i" } },
        { crNo: { $regex: search, $options: "i" } },
      ];
    }

    if (status) filter.status = status;

    const vendors = await Vendor.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, vendors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- UPDATE VENDOR ----------------
export const updateVendor = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Vendor.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await logActivity({
      req,
      action: "Vendor Updated",
      module: "VENDOR",
      description: `${req.user?.name || "Admin"} updated vendor ${updated.companyName} (Shop: ${updated.shopId})`,
    });

    res.json({ success: true, message: "Vendor updated", updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- CHANGE STATUS ----------------
export const toggleVendorStatus = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.status = vendor.status === "active" ? "inactive" : "active";
    await vendor.save();

    await logActivity({
      req,
      action: "Vendor Status Toggled",
      module: "VENDOR",
      description: `${req.user?.name || "Admin"} ${vendor.status === "active" ? "activated" : "deactivated"} vendor ${vendor.companyName} (Shop: ${vendor.shopId})`,
    });

    res.json({
      success: true,
      message: "Status updated",
      status: vendor.status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------- DELETE VENDOR ----------------
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndDelete(req.params.id);

    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    await logActivity({
      req,
      action: "Vendor Deleted",
      module: "VENDOR",
      description: `${req.user?.name || "Admin"} deleted vendor ${vendor.companyName} (Shop: ${vendor.shopId})`,
    });

    res.json({ success: true, message: "Vendor deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};