import mongoose from "mongoose";

const button_style_schema = new mongoose.Schema({
    button_text : { type : String , required : true },
    button_color : { type : String , default : null },
    button_link : { type : String , required : true },
    state_section_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "StateSection"},
    style_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "Style"},
} , { timestamps : true })

export default mongoose.model("ButtonStyle" ,button_style_schema )