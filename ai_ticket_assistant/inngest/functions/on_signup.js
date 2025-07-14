import { inngest } from "../client.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils_or_libs/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;

      // ✅ Step 1: Fetch user from DB
      const user = await step.run("Fetch-user-from-db", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User no longer exists in the database");
        }
        return userObject;
      });

      // ✅ Step 2: Send welcome email
      await step.run("Send-welcome-email", async () => {
        const subject = "Welcome to Our Service!";
        const message =
          "Hi,\n\nThank you for signing up! We are excited to have you on board.\n\nCheers,\nTeam Saarthi AI";

        // 🔧 FIXED: pass individual args, not object
        await sendMail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      console.error("❌ Inngest signup handler error:", error.message);
      return { success: false };
    }
  }
);
