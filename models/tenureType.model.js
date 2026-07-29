import mongoose from "mongoose";

const tenureTypeSchema = new mongoose.Schema({
  type: { type: String, enum: ["freehold", "leasehold"] },
  leasehold_id : { type : mongoose.Schema.Types.ObjectId ,  default : null , ref : "LeaseholdDetail"}
}, { timestamps: true });

export default mongoose.model("TenureType", tenureTypeSchema);