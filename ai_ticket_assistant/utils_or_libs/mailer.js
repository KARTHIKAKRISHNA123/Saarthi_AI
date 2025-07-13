import { text } from "express";
import nodemailer from "nodemailer";

export const sendMail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_SMTP_HOST,
      port: process.env.MAILTRAP_SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.MAILTRAP_SMTP_USER, // generated ethereal user
        pass: process.env.MAILTRAP_SMTP_PASS, // generated ethereal password
      },
    });

    const info = await transporter.sendMail({
      from: '"Ingest TMS" ',
      to: to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
    });

    console.log("Message sent: %s", info.messageId);
    return info;
  } 
  catch (error) {
    console.error("Error sending email:", error.message);
    throw error;

  }
};
