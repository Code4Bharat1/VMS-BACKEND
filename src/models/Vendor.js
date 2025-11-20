import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true },

    contactPerson: { type: String, required: true },

    mobile: { type: String, required: true },

    registeredVehicles: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);
