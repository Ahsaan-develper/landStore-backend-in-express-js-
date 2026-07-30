import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
  status: { type: String, enum: ["pending" , "cancel", "need_more_info", "under_review", "in_progress", "scheduled"] , default : "pending" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing_id: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  interest_type: { type: String, enum: ["buy", "financing", "rent"] },
  estimated_budget: { type : Number , required: true },
  timeLine: { type : String , required : true},
  role: { type: String, enum: ["financier", "buyer", "developer", "representative"] , required : true  },
  enquiry_code: { type: String, unique: true },
  // message: { type: String, required : true  },
}, { timestamps: true });

export default mongoose.model("Enquiry", enquirySchema);