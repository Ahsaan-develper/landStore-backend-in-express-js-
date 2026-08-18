import mongoose from "mongoose";

const dealTypeSchema = new mongoose.Schema({
  name: { type: [String], enum: ["buy", "financing", "jv" , "lease" , "joint venture"] },
}, { timestamps: true });

export default mongoose.model("DealType", dealTypeSchema);