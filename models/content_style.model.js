import mongoose from "mongoose";

const content_style_schema = new mongoose.Schema({
    text_color : { type : String , required : true },
    alignment : { type : String , required : true },
    card_gap : { type : String  , required : true },
    media_id : {type : mongoose.Schema.Types.ObjectId , default : null , ref :"Media"}
} , { timestamps : true });

export default mongoose.model("ContentStyle" ,content_style_schema  )