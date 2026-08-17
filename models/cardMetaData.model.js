import mongoose from "mongoose";

const card_meta_schema = new mongoose.Schema({
    link  : { type : String },
    link_color  : { type : String },
    link_alignment  : { type : String },
    date :{type : String },
    date_color :{type : String },
    date_alignment :{type : String },
    tag :{type : String },
    card_id : {type : mongoose.Schema.Types.ObjectId  , default : null , ref: "CardStyle"},
    
} , {timestamps : true });
card_meta_schema.index({ card_id : 1 });
export default mongoose.model("CardMeta" , card_meta_schema);