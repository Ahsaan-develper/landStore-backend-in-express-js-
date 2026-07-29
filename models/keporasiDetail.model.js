import mongoose from "mongoose";

const koperasiDetailSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  keporasi_name: { type: String, required : true },
  keporasi_reg_number: { type: String,required : true },
}, { timestamps: true });

export default mongoose.model("KoperasiDetail", koperasiDetailSchema);