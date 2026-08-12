import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
  media_url: { type : [String] , required : true},
  public_id:  { type : [String] , required : true},
  media_type: { type: [String], enum: ["image", "document", "video" , "logo"] },
  media_name: { type : [String] , required : true},
}, { timestamps: true });
export default mongoose.model("Media", mediaSchema);