import express from "express";
import {
  createVendor,
  getVendors,
  updateVendor,
  toggleVendorStatus,
  deleteVendor,
  getVendorCategories,
} from "../controllers/vendor.controller.js";

import { protect, adminOnly } from "../middleware/auth.middleware.js";

const router = express.Router();

// Only admin can manage vendors
router.post("/", createVendor);
router.get("/", getVendors);
router.put("/:id", protect, adminOnly, updateVendor);
router.patch("/:id/status", protect, adminOnly, toggleVendorStatus);
router.delete("/:id", protect, adminOnly, deleteVendor);
router.get("/categories/list", getVendorCategories);


export default router;
