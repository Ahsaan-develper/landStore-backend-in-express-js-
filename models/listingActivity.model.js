import mongoose from "mongoose";

const listingActivitySchema = new mongoose.Schema(
  {
    listing_id:      { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true },
    user_id:         { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    visitor_id:      { type: mongoose.Schema.Types.ObjectId, ref: "Visitor", required: true },
    view_count:      { type: Number, default: 0 },
    click_count:     { type: Number, default: 0 },
    last_viewed_at:  { type: Date, default: null },
    last_clicked_at: { type: Date, default: null },
  },
  { timestamps: true }
);

listingActivitySchema.index({ visitor_id: 1, listing_id: 1 }, { unique: true });

export default mongoose.model("ListingActivity", listingActivitySchema);