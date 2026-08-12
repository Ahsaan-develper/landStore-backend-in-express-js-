import mongoose from "mongoose";

const container_style_schema = new mongoose.Schema({
  state_section_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "StateSection"},
  style_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "Style"},
  alignment : { type  : String , required : true },
}, { timestamps: true });


export default mongoose.model("ContainerStyle", container_style_schema);