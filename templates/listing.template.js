import { base } from "./base.template.js";

export const listingStatusTemplate = ({ name, listing_title, status, listing_id }) => ({
  subject: `Your Listing Status Updated — ${listing_title}`,
  html: base(`
    <h2>Listing Status Update</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your listing <strong>${listing_title}</strong> status has been updated to:</p>
    <span class="badge ${status}">${status.replace("_", " ").toUpperCase()}</span>
    <hr class="divider"/>
    <p>${
      status === "active"   ? "Congratulations! Your listing is now live and visible to buyers."         :
      status === "inactive" ? "Your listing has been deactivated. Please contact support for more info." :
                              "Your listing is under review. We will notify you once it is approved."
    }</p>
    <a class="btn" href="${process.env.FRONTEND_URL}/listing/${listing_id}">View Listing</a>
  `),
});