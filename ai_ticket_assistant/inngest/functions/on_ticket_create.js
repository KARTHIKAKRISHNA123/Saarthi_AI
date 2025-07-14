import { sendMail } from "../../utils_or_libs/mailer.js";
import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import analyzeTicket from "../../utils_or_libs/analyzeTicket.js";

export const onTicketCreated = inngest.createFunction(
  { id: "on-ticket-created", retries: 2 },
  { event: "ticket/created" },

  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObject = await Ticket.findById(ticketId);
        if (!ticketObject) {
          throw new NonRetriableError("Ticket not found");
        }
        return ticketObject;
      });

      await step.run("update-initial-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      const aiResponse = await analyzeTicket(ticket);

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];

        if (aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: ["low", "medium", "high"].includes(aiResponse.priority)
              ? aiResponse.priority
              : "medium",
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse.relatedSkills,
          });

          skills = aiResponse.relatedSkills;
        }

        return skills;
      });

      const moderator = await step.run("assign-moderator", async () => {
        let user = await User.findOne({
          role: "moderator",
          skills: {
            $elemMatch: {
              $regex: relatedSkills.join("|"),
              $options: "i",
            },
          },
        });

        if (!user) {
          user = await User.findOne({ role: "admin" });
        }

        await Ticket.findByIdAndUpdate(ticket._id, {
          assignedTo: user?._id || null,
        });

        return user;
      });

      await step.run("send-email-notification", async () => {
        if (moderator) {
          const finalTicket = await Ticket.findById(ticket._id);
          await sendMail(
            moderator.email,
            "Ticket Assigned",
            `A new ticket titled "${finalTicket.title}" has been assigned to you.`
          );
        }
      });

      return { success: true };
    } catch (err) {
      console.error("❌ Error in ticket creation Inngest function:", err.message);
      return { success: false };
    }
  }
);
