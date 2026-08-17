import mongoose from "mongoose";

const container_style_schema = new mongoose.Schema({
  state_section_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "StateSection"},
  style_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "Style"},
  alignment : { type  : String , required : true },
}, { timestamps: true });

container_style_schema.index({ state_section_id : 1 } , { unique : true })
container_style_schema.index({ style_id :  1})
export default mongoose.model("ContainerStyle", container_style_schema);