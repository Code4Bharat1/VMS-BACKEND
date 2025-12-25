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
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
});

dotenv.config();

const app = express();

// --------------------- Middlewares --------------------- //
const allowedOrigins = [
  "http://localhost:3000",
  "https://vms.nexcorealliance.com",
  "https://www.vms.nexcorealliance.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Rate Limiter
app.use("/api", limiter);

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
const PORT = process.env.PORT || 6094;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 VMS Backend running on http://localhost:${PORT}`);
  });
});
