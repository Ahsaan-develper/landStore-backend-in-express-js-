import mongoose from "mongoose";

const entityTagSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  title: { type: [String], required: true },
}, { timestamps: true });

export default mongoose.model("EntityTag", entityTagSchema);