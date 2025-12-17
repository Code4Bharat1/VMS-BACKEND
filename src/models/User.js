import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    phone: { type: String, default: "" },

    password: { type: String, required: true },

    assignedBay: { type: String, default: "" },

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
