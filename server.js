import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

// Routes
import authRoutes from "./src/routes/auth.routes.js";
import staffRoutes from "./src/routes/staff.routes.js";
import supervisorRoutes from "./src/routes/supervisor.routes.js"; 
import vendorRoutes from "./src/routes/vendor.routes.js";
import bayRoutes from "./src/routes/bay.routes.js";
import entryRoutes from "./src/routes/entry.routes.js";
import ocrRoutes from "./src/routes/ocr.routes.js";

dotenv.config();

const app = express();

// --------------------- Middlewares --------------------- //
app.use(cors({
  origin : 'http://localhost:3000',
  credentials : true,
}));
app.use(express.json());

// --------------------- Health Check --------------------- //
app.get("/api/v1/health", (req, res) => {
  res.json({ status: "ok", message: "VMS backend running" });
});

// --------------------- API Routes --------------------- //
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/supervisors", supervisorRoutes);
app.use("/api/v1/vendors", vendorRoutes);
app.use("/api/v1/bays", bayRoutes);
app.use("/api/v1/entries", entryRoutes);
app.use("/api/v1/ocr", ocrRoutes);

// --------------------- Error Handler --------------------- //
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// --------------------- Start Server --------------------- //
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 VMS Backend running on http://localhost:${PORT}`);
  });
});
