import mongoose from "mongoose";

const card_icon_schema = new mongoose.Schema({
    svg : { type : String , required : true },
    svg_color : { type : String , required : true },
} , { timestamps : true })

export default mongoose.model("Icon" , card_icon_schema)