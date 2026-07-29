import mongoose from "mongoose";

const dealTypeSchema = new mongoose.Schema({
  name: { type: [String], enum: ["buy", "financing", "jv"] },
}, { timestamps: true });

export default mongoose.model("DealType", dealTypeSchema);