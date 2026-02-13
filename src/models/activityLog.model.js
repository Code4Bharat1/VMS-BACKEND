import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    actorRole: {
      type: String,
      enum: ["admin", "supervisor", "staff"],
      required: true,
    },

    action: {
      type: String,
      required: true, // e.g. "CREATE_STAFF", "LOGIN", "CREATE_ENTRY"
    },

    module: {
      type: String,
      required: true, // e.g. "AUTH", "STAFF", "ENTRY", "BAY"
    },

    description: {
      type: String, // Human readable message
    },

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null, // affected user / entry / bay
    },

    bay: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bay",
      default: null,
    },

    ipAddress: String,
    userAgent: String,

    meta: {
      type: Object, // flexible extra data
      default: {},
    },
     createdAt: {
      type: Date,
      default: Date.now,
      // expires: 900, // ⏱️ 15 minutes (900 seconds)
    },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;