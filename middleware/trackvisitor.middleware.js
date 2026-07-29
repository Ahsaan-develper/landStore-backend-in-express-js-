import listingActivityModel from "../models/listingActivity.model.js";
import visitorModel from "../models/visitor.model.js";


function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || req.ip || "unknown";
}

// Run on every request — creates or updates visitor doc
export async function trackVisitor(req, res, next) {
  try {
    const ip         = getClientIp(req);
    const user_agent = req.headers["user-agent"] || "unknown";

    const visitor = await visitorModel.findOneAndUpdate(
      { ip, user_agent },
      {
        $set:         { last_seen_at: new Date() },
        $setOnInsert: { ip, user_agent, is_identified: false, user_id: null },
        $inc:         { visit_count: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    req.visitor = visitor;
    next();
  } catch (err) {
    console.error("[trackVisitor]", err.message);
    next();
  }
}

// Call after login or any register to link visitor to real user
export async function linkVisitorToUser(req, userId) {
  try {
    if (!req.visitor) return;
    if (req.visitor.user_id?.toString() === userId.toString()) return;

    // Mark visitor as identified
    req.visitor = await visitorModel.findOneAndUpdate(
      { ip: req.visitor.ip, user_agent: req.visitor.user_agent },
      { $set: { user_id: userId, is_identified: true } },
      { new: true }
    );

    // Backfill user_id on all listing activity this visitor created anonymously
    await listingActivityModel.updateMany(
      { visitor_id: req.visitor._id, user_id: null },
      { $set: { user_id: userId } }
    );
  } catch (err) {
    console.error("[linkVisitorToUser]", err.message);
  }
}