import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: [String], required: true },
}, { timestamps: true });
folderSchema.index({ user_id : 1 });
export default mongoose.model("Folder", folderSchema);