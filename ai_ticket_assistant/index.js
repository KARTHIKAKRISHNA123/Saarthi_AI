// Use "type": "module" in package.json to allow import syntax
import express from 'express';
import mongoose from 'mongoose';
import { serve } from 'inngest/express';
import cors from 'cors';
import dotenv from 'dotenv';

import userRoutes from './routes/user.js';         // ✅ User route
import ticketRoutes from './routes/ticket.js';     // ✅ FIXED: this should point to ticket route, not model
import { inngest } from './inngest/client.js';
import { onUserSignup } from './inngest/functions/on_signup.js';
import { onTicketCreated } from './inngest/functions/on_ticket_create.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', userRoutes);       // ✅ Auth-related APIs (signup, login, etc.)
app.use('/api/tickets', ticketRoutes);  // ✅ Ticket APIs (create, fetch, etc.)

// Inngest Webhook Handler
app.use('/api/inngest', serve({
  client: inngest,
  functions: [onUserSignup, onTicketCreated],
}));

// Connect MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));
