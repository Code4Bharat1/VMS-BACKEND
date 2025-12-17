import mongoose from "mongoose";

const baySchema = new mongoose.Schema(
  {
    bayName: { type: String, required: true },

    bayType: { type: String, default: "general" }, 
    // Optional: You can allow admin to categorize bays (A1, B3, Loading, Dock, etc.)

    
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    }
  },
  { timestamps: true }
);

export default mongoose.model("Bay", baySchema);
