import { Inngest } from "../client.js";

import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import {sendMail} from "../../utils_or_libs/mailer.js";

export const onSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("Send-welcome-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User no longer exists in the database");
        }
        return userObject;
      });
      await step.run("Send-welcome-email", async () => {
        // Simulate sending a welcome email

        const subject = "Welcome to Our Service!";
        const message =
          "Hi \n \n Thank you for signing up! We are excited to have you on board.";

        await sendMail({
          to: user.email,
          subject,
          text: message,
        });
      });
      return { success: true };
    } catch (error) {
      console.error("Error running the step", error.message);
      return { success: false };
    }
  }
);
