import mongoose from "mongoose";

const subDistrictSchema = new mongoose.Schema({
  district_id: { type: mongoose.Schema.Types.ObjectId, ref: "District" },
  sub_district: { type : String , required : true},
  session: { type : String , required : true},
}, { timestamps: true });
subDistrictSchema.index({ district_id: 1 }, { unique: true });
export default mongoose.model("SubDistrict", subDistrictSchema);