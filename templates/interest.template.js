import { base } from "./base.template.js";

export const interestSubmittedTemplate = ({ name, listing_title, interest_type, estimated_budget, timeLine }) => ({
  subject: `Interest Submitted — ${listing_title}`,
  html: base(`
    <h2>Interest Submitted Successfully</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your interest has been submitted for <strong>${listing_title}</strong>.</p>
    <hr class="divider"/>
    <p><strong>Interest Type:</strong> ${interest_type}</p>
    <p><strong>Estimated Budget:</strong> MYR ${Number(estimated_budget).toLocaleString()}</p>
    <p><strong>Timeline:</strong> ${timeLine}</p>
    <hr class="divider"/>
    <p>Our team will review your interest shortly.</p>
    <span class="badge pending">PENDING</span>
  `),
});

export const interestStatusTemplate = ({ name, listing_title, status, interest_id }) => ({
  subject: `Your Interest Status Updated — ${listing_title}`,
  html: base(`
    <h2>Interest Status Update</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your interest in <strong>${listing_title}</strong> has been updated to:</p>
    <span class="badge ${status}">${status.replace("_", " ").toUpperCase()}</span>
    <hr class="divider"/>
    <p>${
      status === "under_review" ? "Your interest is currently being reviewed by our team." :
      status === "cancelled"    ? "Your interest has been cancelled. You can resubmit anytime." :
                                  "Your interest has been received and is pending review."
    }</p>
    <a class="btn" href="${process.env.FRONTEND_URL}/interest/${interest_id}">View Interest</a>
  `),
});