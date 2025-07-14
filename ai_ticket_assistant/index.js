// Use "type": "module" in package.json to allow import syntax
import express from 'express';
import mongoose from 'mongoose';
import { serve } from 'inngest/express'; // ✅ Correct import syntax
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/user.js';       // ✅ Corrected relative path
import ticketRoutes from './models/ticket.js';   // ✅ Corrected relative path
import { inngest } from './inngest/client.js';
import { onUserSignup } from './inngest/functions/on_signup.js';
import { onTicketCreated } from './inngest/functions/on_ticket_create.js';
import jwt from "jsonwebtoken";


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/tickets', ticketRoutes);

// Inngest handler
app.use('/api/inngest', serve({
  client: inngest,
  functions: [onUserSignup, onTicketCreated],
}));

// ✅ FIXED: environment variable should not be in quotes
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
