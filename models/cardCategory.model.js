import mongoose from "mongoose";

const add_card_category_schema = new mongoose.Schema({
    category_name : { type : String , required : true },
    content_id : { type : mongoose.Schema.Types.ObjectId ,  ref : "ContentStyle" , required : true },
} , { timestamps : true })
add_card_category_schema.index({ content_id :  1});
export default mongoose.model("CardCategory" , add_card_category_schema);