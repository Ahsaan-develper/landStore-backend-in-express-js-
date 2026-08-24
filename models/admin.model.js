import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  admin_role: { type: String, enum: ["listing_admin", "super_admin", "enquiry_admin", "user_admin" ,"section_adminuser_id" ] },
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
}, { timestamps: true });
adminSchema.index({user_id : 1})
export default mongoose.model("Admin", adminSchema);