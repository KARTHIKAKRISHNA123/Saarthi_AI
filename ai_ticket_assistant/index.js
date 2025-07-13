import express from 'express';

import mongoose, { mongo } from 'mongoose';
import {serve} from inngest/express;

import cors from 'cors';
import userRoutes from "../ai_ticket_assistant/routes/user.js";
import ticketRoutes from "../ai_ticket_assistant/models/ticket.js";
import { inngest } from './inngest/client.js';
import {inngest} from "./inngest/client.js";
import {onUserSignup} from "./inngest/functions/on_signup.js";
import {onTicketCreated} from  "./inngest/functions/on_ticket_create.js";
import dotenv from "dotenv";
dotenv.config();


const app = express();
const PORT = 3000 || process.env.PORT;

app.use(cors());
app.use(express.json());

app.use("/api/auth", userRoutes);
app.use("/api/tickets", ticketRoutes);

app.use("/api/inngest", serve({
    client: inngest,
    functions: [onUserSignup, onTicketCreated]
}))

mongoose.connect('process.env.MONGO_URI')
    .then (() => {
        console.log('MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log('Server is running on port ${PORT}');
        });
    })

    .catch((err) => console.error('MongoDB connection error:', err));
    