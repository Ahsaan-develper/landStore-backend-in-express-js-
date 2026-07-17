import { listingStatusTemplate }                          from "../templates/listing.template.js";
import { interestSubmittedTemplate, interestStatusTemplate } from "../templates/interest.template.js";
import { sendEmail } from "../utils/emailSend.js";
import { emitter } from "./emitter.js";

emitter.on("listing:status_updated", async (payload) => {
  try {
    const { subject, html } = listingStatusTemplate(payload);
    await sendEmail({ to: payload.email, subject, html });
  } catch (err) {
    console.error("Email failed [listing:status_updated]:", err.message);
  }
});

emitter.on("interest:submitted", async (payload) => {
  try {
    const { subject, html } = interestStatusTemplate(payload);
    await sendEmail({ to: payload.email, subject, html });
  } catch (err) {
    console.error("Email failed [interest:submitted]:", err.message);
  }
});

emitter.on("interest:status_updated", async (payload) => {
  try {
    const { subject, html } = interestStatusTemplate(payload);
    await sendEmail({ to: payload.email, subject, html });
  } catch (err) {
    console.error("Email failed [interest:status_updated]:", err.message);
  }
});