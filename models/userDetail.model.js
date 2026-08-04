import mongoose from "mongoose";

const userDetailSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  phone_number: { type: String, unique: true, required: true },
  IC: { type: String, unique: true , sparse: true },
}, { timestamps: true });

export default mongoose.model("UserDetail", userDetailSchema);