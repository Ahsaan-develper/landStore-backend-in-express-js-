import mongoose from "mongoose";

const card_icon_schema = new mongoose.Schema({
    card_icon : { type : String , required : true },
    icon_color : { type : String , required : true },
    icon_alignment : { type : String , required : true },
    card_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "CardStyle" , },
} , { timestamps : true })
card_icon_schema.index({ card_id : 1 })
export default mongoose.model("Icon" , card_icon_schema)