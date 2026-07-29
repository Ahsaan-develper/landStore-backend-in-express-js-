import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
  status: { type: String, enum: ["pending ", "reject", "need_more_info", "under_review", "in_progress", "scheduled"] },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing_id: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  interest_type: { type: String, enum: ["buy", "financing", "rent"] },
  estimated_budget: Number,
  timeLine: { type : String , required : true},
  role: { type: String, enum: ["financier", "buyer", "developer", "representative"] },
  enquiry_code: { type: String, unique: true },
  message: { type: String, required : true  },
}, { timestamps: true });

export default mongoose.model("Enquiry", enquirySchema);