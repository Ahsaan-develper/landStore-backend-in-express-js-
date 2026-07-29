import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
  enquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: "Enquiry" },
  visit_date: { type : Date , required : true},
  scheduled_date_time: { type : Date , required : true},
  visit_address: { type : String , required : true},
  status: { type: String, enum: ["pending", "rejected", "completed"] },
  notes:{ type : String , required : true},
}, { timestamps: true });

export default mongoose.model("Schedule", scheduleSchema);