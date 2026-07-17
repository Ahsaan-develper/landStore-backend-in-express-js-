const base = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body        { margin:0; padding:0; background:#f4f4f4; font-family: Arial, sans-serif; }
    .wrapper    { max-width:600px; margin:40px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
    .header     { background:#1a3c5e; padding:30px 40px; text-align:center; }
    .header img { height:40px; }
    .header h1  { color:#ffffff; margin:10px 0 0; font-size:20px; letter-spacing:1px; }
    .body       { padding:36px 40px; color:#333333; }
    .body h2    { margin-top:0; font-size:18px; color:#1a3c5e; }
    .body p     { font-size:14px; line-height:1.7; color:#555555; }
    .badge      { display:inline-block; padding:6px 16px; border-radius:20px; font-size:13px; font-weight:bold; margin:12px 0; }
    .pending    { background:#fff3cd; color:#856404; }
    .active     { background:#d4edda; color:#155724; }
    .inactive   { background:#f8d7da; color:#721c24; }
    .under_review { background:#cce5ff; color:#004085; }
    .cancelled  { background:#f8d7da; color:#721c24; }
    .btn        { display:inline-block; margin-top:20px; padding:12px 28px; background:#1a3c5e; color:#ffffff !important; text-decoration:none; border-radius:6px; font-size:14px; }
    .divider    { border:none; border-top:1px solid #eeeeee; margin:24px 0; }
    .footer     { background:#f9f9f9; padding:20px 40px; text-align:center; font-size:12px; color:#aaaaaa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>LandStore</h1>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} LandStore. All rights reserved.<br/>
      No direct seller contact. Bypass attempts result in immediate account suspension.
    </div>
  </div>
</body>
</html>`;

// ─── LISTING STATUS CHANGED ───────────────────────────────
export const listingStatusTemplate = ({ name, listing_title, status, listing_id }) => ({
  subject: `Your Listing Status Updated — ${listing_title}`,
  html: base(`
    <h2>Listing Status Update</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your listing <strong>${listing_title}</strong> status has been updated to:</p>
    <span class="badge ${status}">${status.replace("_", " ").toUpperCase()}</span>
    <hr class="divider"/>
    <p>
      ${status === "active"    ? "Congratulations! Your listing is now live and visible to buyers." : ""}
      ${status === "inactive"  ? "Your listing has been deactivated. Please contact support for more info." : ""}
      ${status === "pending"   ? "Your listing is under review. We will notify you once it is approved." : ""}
    </p>
    <a class="btn" href="${process.env.FRONTEND_URL}/listing/${listing_id}">View Listing</a>
  `),
});

// ─── INTEREST STATUS CHANGED ──────────────────────────────
export const interestStatusTemplate = ({ name, listing_title, status, interest_id }) => ({
  subject: `Your Interest Status Updated — ${listing_title}`,
  html: base(`
    <h2>Interest Status Update</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your interest in <strong>${listing_title}</strong> has been updated to:</p>
    <span class="badge ${status}">${status.replace("_", " ").toUpperCase()}</span>
    <hr class="divider"/>
    <p>
      ${status === "under_review" ? "Great news! Your interest is currently being reviewed by our team." : ""}
      ${status === "cancelled"    ? "Your interest has been cancelled. You can resubmit anytime." : ""}
      ${status === "pending"      ? "Your interest has been received and is pending review." : ""}
    </p>
    <a class="btn" href="${process.env.FRONTEND_URL}/interest/${interest_id}">View Interest</a>
  `),
});

// ─── INTEREST SUBMITTED ───────────────────────────────────
export const interestSubmittedTemplate = ({ name, listing_title, interest_type, estimated_budget, timeLine }) => ({
  subject: `Interest Submitted — ${listing_title}`,
  html: base(`
    <h2>Interest Submitted Successfully</h2>
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your interest has been submitted for <strong>${listing_title}</strong>. Here's a summary:</p>
    <hr class="divider"/>
    <p><strong>Interest Type:</strong> ${interest_type}</p>
    <p><strong>Estimated Budget:</strong> MYR ${estimated_budget.toLocaleString()}</p>
    <p><strong>Timeline:</strong> ${timeLine}</p>
    <hr class="divider"/>
    <p>Our team will review your interest shortly. You will be notified of any updates.</p>
    <span class="badge pending">PENDING</span>
  `),
});