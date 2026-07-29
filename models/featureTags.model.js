import mongoose from "mongoose";
const featureTagSchema = new mongoose.Schema({
  tag: { type: [String], required: true },
}, { timestamps: true });
export default mongoose.model("FeatureTag", featureTagSchema);