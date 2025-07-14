import express from "express";
import {
  getUsers,
  login,
  logout,
  signup,
  updateUser,
} from "../controllers/user.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// 🔐 Auth Routes
router.post("/signup", signup);             // Public - Register new user
router.post("/login", login);               // Public - Login and get token
router.post("/logout", logout);             // Protected - Logout (JWT)

// 👤 Admin/User Management Routes
router.get("/users", authenticate, getUsers);         // Admin only
router.post("/update-user", authenticate, updateUser); // Admin only

export default router;
