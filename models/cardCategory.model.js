import mongoose from "mongoose";

const add_card_category_schema = new mongoose.Schema({
    category_name : { type : String , required : true },
    content_id : { type : String ,  ref : "ContentStyle" , default : null},
} , { timestamps : true })

export default mongoose.model("CardCategory" , add_card_category_schema);