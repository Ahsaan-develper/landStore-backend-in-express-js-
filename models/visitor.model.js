import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema(
  {
    user_id:       { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ip:            { type: String, required: true },
    user_agent:    { type: String, default: "unknown" },
    is_identified: { type: Boolean, default: false },
    visit_count:   { type: Number, default: 1 },
    last_seen_at:  { type: Date, default: Date.now },
  },
  { timestamps: true }
);

visitorSchema.index({ ip: 1, user_agent: 1 });

export default mongoose.model("Visitor", visitorSchema);