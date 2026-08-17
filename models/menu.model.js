import mongoose from "mongoose";

const menu_schema = new mongoose.Schema({
    menu : { type : String , required : true },
    menu_name : { type : String , required : true },
    menu_color : { type : String , required : true },
    menu_alignment : { type : String , required : true },
    link : { type : String , required : true },
    style_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "Style" },
    content_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "ContentStyle" },
} , { timestamps : true })

export default mongoose.model("Menu" , menu_schema)