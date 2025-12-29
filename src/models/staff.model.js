import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, default: "" },

    password: { type: String, required: true },

    isActive: { type: Boolean, default: true },

    // Staff → ONE bay
    assignedBay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bay",
    },

    role: {
      type: String,
      enum: ["staff"],
      default: "staff",
    },


  },
  { timestamps: true }
);

export const Staff = mongoose.model("Staff", staffSchema);
