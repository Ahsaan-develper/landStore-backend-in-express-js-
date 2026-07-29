
import listingActivityModel from "../models/listingActivity.model.js";

const CLICK_COOLDOWN = 5  * 60 * 60 * 1000; // 5 hours
const VIEW_COOLDOWN  = 24 * 60 * 60 * 1000; // 24 hours

export async function trackListingView(req, listing_id) {
  try {
    if (!req.visitor) return;

    const visitor_id = req.visitor._id;
    const user_id    = req.visitor.user_id ?? null;
    const now        = new Date();

    const activity = await listingActivityModel.findOne({ visitor_id, listing_id });

    if (!activity) {
      await listingActivityModel.create({
        listing_id,
        visitor_id,
        user_id,
        view_count:    1,
        last_viewed_at: now,
      });
      return;
    }

    const elapsed = now - (activity.last_viewed_at || 0);
    if (elapsed >= VIEW_COOLDOWN) {
      await listingActivityModel.findByIdAndUpdate(activity._id, {
        $inc: { view_count: 1 },
        $set: { last_viewed_at: now },
      });
    }
    // under 24h — not counted
  } catch (err) {
    console.error("[trackListingView]", err.message);
  }
}

export async function trackListingClick(req, listing_id) {
  try {
    if (!req.visitor) return;

    const visitor_id = req.visitor._id;
    const user_id    = req.visitor.user_id ?? null;
    const now        = new Date();

    const activity = await listingActivityModel.findOne({ visitor_id, listing_id });

    if (!activity) {
      await listingActivityModel.create({
        listing_id,
        visitor_id,
        user_id,
        click_count:    1,
        last_clicked_at: now,
      });
      return;
    }

    const elapsed = now - (activity.last_clicked_at || 0);
    if (elapsed >= CLICK_COOLDOWN) {
      await listingActivityModel.findByIdAndUpdate(activity._id, {
        $inc: { click_count: 1 },
        $set: { last_clicked_at: now },
      });
    }
    // under 5h — not counted
  } catch (err) {
    console.error("[trackListingClick]", err.message);
  }
}