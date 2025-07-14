import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createTicket, getTicket, getTickets } from "../controllers/ticket.js";

const router = express.Router();

// Get all tickets
router.get("/", authenticate, getTickets);

// 🔴 ERROR in your code: router.get("/id", ...) ← "id" is treated as a string, not dynamic
// ✅ FIXED: Use ":id" to make it a route parameter
router.get("/:id", authenticate, getTicket);

// Create a new ticket
router.post("/", authenticate, createTicket);

export default router;
