import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";
import { errorHandlerMiddleware } from "../Middlewares/error-handler-middleware.js";

const SendEmailServices = errorHandlerMiddleware(
  async ({ to, subject, html, attachments = [] }) => {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transport.sendMail({
      from: `Cure <${process.env.EMAIL}>`,
      to,
      subject,
      html,
      attachments,
    });
    return info;
  }
);

export const sendEmail = new EventEmitter();
sendEmail.on("SendEmail", (...arg) => {
  const { to, subject, html, attachments } = arg[0];
  SendEmailServices({
    to,
    subject,
    html,
    attachments,
  });
});
