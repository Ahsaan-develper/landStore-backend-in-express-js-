const interestUserSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  listing_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Listing" },
  interest_id:{ type: mongoose.Schema.Types.ObjectId, required: true, ref: "Interest" }, 
}, { timestamps: true });

interestUserSchema.index({ user_id: 1, listing_id: 1 }, { unique: true });

export default mongoose.model("InterestUser", interestUserSchema);