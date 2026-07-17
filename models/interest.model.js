const interestSchema = new mongoose.Schema({
  interest_type:    { type: String, required: true, enum: ["buy", "financing", "rent"] },
  estimated_budget: { type: Number, required: true },
  timeLine:         { type: String, required: true },
  role:             { type: String, required: true, enum: ["Financier", "Buyer", "Developer", "Representative"] },
  message:          { type: String, required: true, maxlength: 500 },  // ✅ max 500 chars
  listing_id:       { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Listing" },
  user_id:          { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },   // ✅ move here — belongs in main doc
  status:           { type: String, default: "pending", enum: ["pending", "under_review", "cancelled"] }, // ✅ add status
}, { timestamps: true });


interestSchema.index({ user_id: 1, listing_id: 1 }, { unique: true });

export default mongoose.model("Interest", interestSchema);