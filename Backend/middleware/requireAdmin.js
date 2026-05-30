import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const requireAdmin = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    const authHeader = req.headers.authorization;
    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
    if (!token) {
      return res.status(401).json({ message: "Login required", success: false });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    if (!user || user.role !== "Admin") {
      return res.status(403).json({ message: "Admin access only", success: false });
    }
    req.id = String(user._id);
    req.adminUser = user;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid session", success: false });
  }
};

export default requireAdmin;
