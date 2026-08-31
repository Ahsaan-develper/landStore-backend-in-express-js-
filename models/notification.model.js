import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  listing_id: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  enquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: "Enquiry" },
  schedule_id: { type: mongoose.Schema.Types.ObjectId, ref: "Schedule" },
  notifiable_type: { type: String, enum: ["Enquiry", "Listing", "Schedule" , "Account"] },
  title: { type : String , required : true},
  message: { type : String , required : true},
}, { timestamps: true });

notificationSchema.index({  enquiry_id : 1 })
notificationSchema.index({ listing_id : 1 })
notificationSchema.index({ schedule_id : 1 })
export default mongoose.model("Notification", notificationSchema);