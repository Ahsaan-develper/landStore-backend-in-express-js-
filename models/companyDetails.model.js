import mongoose from "mongoose";

const companyDetailSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  company_name: { type: String, default: null },
  SSM_reg_number: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("CompanyDetail", companyDetailSchema);