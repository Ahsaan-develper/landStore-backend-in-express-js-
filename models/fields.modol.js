import mongoose from "mongoose";

const fields_schema = new mongoose.Schema({
    field_data : {
        field_name : { type : String , required : true },
        field_data : { type : String , required : true },
        field_label : { type : String , required : true },
    },
    media_id : { type : String , ref : "Media" , default : null},
    card_style_id : { type : String ,  ref : "CardStyle" , default : null},
    content_style_id : { type : String ,  ref : "ContentStyle" , default : null},
} , { timestamps : true });


export default mongoose.model("Fields" , fields_schema);