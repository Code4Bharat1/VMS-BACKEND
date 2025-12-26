import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },

    contactPerson: { type: String, required: true },

    mobile: { type: String, required: true },

    // registeredVehicles: { type: [String], default: [] }, // array of strings

    date: { type: Date, default: Date.now },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export const Vendor = mongoose.model("Vendor", vendorSchema);
