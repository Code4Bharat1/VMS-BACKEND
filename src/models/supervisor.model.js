import mongoose from "mongoose";

const supervisorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, default: "" },

    password: { type: String, required: true },

    isActive: { type: Boolean, default: true },

    // Supervisor → MULTIPLE bays
    managedBays: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bay",
      },
    ],
    assignedBay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bay",
    },
    role: {
      type: String,
      enum:  ["supervisor"],
      default: "supervisor",
    },
  },
  { timestamps: true }
);

export const Supervisor = mongoose.model("Supervisor", supervisorSchema);
