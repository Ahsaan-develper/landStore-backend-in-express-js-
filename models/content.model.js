import mongoose from "mongoose";

const content_style_schema = new mongoose.Schema({
    state_section_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "StateSection"},
    media_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "Media"},
    style_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "Style"},
    card_data_id : { type : mongoose.Schema.Types.ObjectId , default: null , ref : "CardData"},
    card_gap : { type : String  , required : true  , default : "0%" ,  },
    copy_right : { type : String  , default : null},
} , { timestamps : true });

content_style_schema.index({ state_section_id :  1})
export default mongoose.model("ContentStyle" ,content_style_schema  )