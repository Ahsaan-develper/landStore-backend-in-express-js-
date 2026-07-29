import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  listing_id: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", default: null },
  enquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: "Enquiry", default: null },
  schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule", default: null },
  notifiable_type: { type: String, enum: ["Enquiry", "Listing", "Schedule"] },
  title: { type : String , required : true},
  message: { type : String , required : true},
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);