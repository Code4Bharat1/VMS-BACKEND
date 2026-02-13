import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    token = token.replace("Bearer ", "");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select(
      "_id name role assignedBay managedBays"
    );

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    req.user.id = user._id.toString(); // ✅ SAFE ADDITION

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};



export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only route" });
  }
  next();
};

export const supervisorOnly = (req, res, next) => {
  if (req.user.role !== "supervisor") {
    return res.status(403).json({ message: "Supervisor only route" });
  }
  next();
};

export const staffOnly = (req, res, next) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ message: "Staff only route" });
  }
  next();
};
