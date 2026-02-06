// Entry

import mongoose from "mongoose";

const entrySchema = new mongoose.Schema(
  {
    // Visitor Information
    visitorName: { type: String },
    visitorMobile: { type: String },
    visitorCompany: { type: String },
    qidNumber: { type: String },

    // Vehicle Information
    vehicleNumber: { type: String, required: true },
    vehicleType: { type: String, default: "truck" },

    // Purpose of visit (manual entry)
    purpose: {
      type: String,
      trim: true,
    },

    // Vendor Reference
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },

    // Bay Assignment
    bayId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bay",
    },
    assignedBay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bay",
    },
    // Entry/Exit Times
    inTime: { type: Date, default: Date.now },
    outTime: { type: Date, default: null },

    // Entry Method: Manual / OCR / QR
    entryMethod: {
      type: String,
      enum: ["manual", "ocr", "qr"],
      default: "manual",
    },

    // Created by (Staff)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    processingTimeMs: {
  type: Number, // milliseconds
},

  },
  { timestamps: true }
);

export const Entry = mongoose.model("Entry", entrySchema);
