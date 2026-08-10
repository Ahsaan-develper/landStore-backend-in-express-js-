import mongoose from "mongoose";

const add_card_schema = new mongoose.Schema({
    card_name : { type : String , required : true },
    content_style_id : { type : String ,  ref : "ContentStyle" , default : null},

} , { timestamps : true })

export default mongoose.model("Card" , add_card_schema);