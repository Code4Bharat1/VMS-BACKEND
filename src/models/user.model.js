import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, default: "" },

    password: { type: String, required: true },

    // Staff → ONE bay
    assignedBay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bay",
    },

    // Supervisor → MULTIPLE bays
    managedBays: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bay",
      },
    ],

    role: {
      type: String,
      enum: ["admin", "staff", "supervisor"],
      default: "staff",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    requestSource: {
      type: String,
      enum: ["admin", "supervisor"],
      default: "admin",
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
