import mongoose from "mongoose";
const leaseholdDetailSchema = new mongoose.Schema({
  start_date: { type : Date , required : true},
  end_year: { type : String , required : true},
}, { timestamps: true });

export default mongoose.model("LeaseholdDetail", leaseholdDetailSchema);