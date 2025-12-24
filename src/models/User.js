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

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
