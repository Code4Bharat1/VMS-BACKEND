import mongoose from "mongoose";

const PlateSchema = new mongoose.Schema(
  {
    plate: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PlateSchema.index({ plate: 1 });
PlateSchema.index({ createdAt: -1 });

export default mongoose.model("Plate", PlateSchema);
