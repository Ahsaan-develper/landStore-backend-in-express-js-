import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
  state_id: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
  district: { type : String , required : true }
}, { timestamps: true });

export default mongoose.model("District", districtSchema);