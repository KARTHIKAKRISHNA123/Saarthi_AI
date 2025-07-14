import { inngest } from "../inngest/client.js";
import Ticket from "../models/ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newTicket = await Ticket.create({
      title,
      description,
      createdBy: req.user._id.toString(),
    });

    await inngest.send({
      name: "ticket/created",
      data: {
        ticketId: newTicket._id.toString(),
        title,
        description,
        createdBy: req.user._id.toString(),
      },
    });

    return res.status(201).json({
      message: "Ticket created and processing started",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("❌ Error creating ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getTickets = async (req, res) => {
  try {
    const user = req.user;
    let tickets = [];

    if (user.role !== "user") {
      // Admin, moderator, or helper
      tickets = await Ticket.find({})
        .populate("assignedTo", ["email", "name", "_id"])
        .populate("createdBy", ["email", "name", "_id"])
        .sort({ createdAt: -1 });
    } else {
      // Regular user - only see their own tickets
      tickets = await Ticket.find({ createdBy: user._id })
        .populate("assignedTo", ["email", "name", "_id"])
        .populate("createdBy", ["email", "name", "_id"])
        .sort({ createdAt: -1 });
    }

    return res.status(200).json(tickets);
  } catch (error) {
    console.error("❌ Error fetching tickets:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getTicket = async (req, res) => {
  try {
    const user = req.user;
    let ticket;

    if (user.role !== "user") {
      // Admin or staff can access any ticket
      ticket = await Ticket.findById(req.params.id)
        .populate("assignedTo", ["email", "name", "_id"])
        .populate("createdBy", ["email", "name", "_id"]);
    } else {
      // Regular user can only access their own ticket
      ticket = await Ticket.findOne({
        _id: req.params.id,
        createdBy: user._id,
      })
        .populate("assignedTo", ["email", "name", "_id"])
        .populate("createdBy", ["email", "name", "_id"]);
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    return res.status(200).json({ ticket });
  } catch (error) {
    console.error("❌ Error fetching ticket:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
