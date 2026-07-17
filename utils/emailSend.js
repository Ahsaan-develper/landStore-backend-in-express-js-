import { transporter } from "../config/email.config.js";

export const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"LandStore" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};