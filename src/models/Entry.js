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

    // Returning Vehicle Flag
    isReturning: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model("Entry", entrySchema);
