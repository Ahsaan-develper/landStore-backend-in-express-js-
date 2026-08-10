import mongoose from "mongoose";


const card_style_schema = new mongoose.Schema({
    text_color : { type : String , required : true },
    alignment : { type : String , required : true },
    background_color : { type : String , required : true },
    border_color : { type : String , required : true },
    padding : { type : [String] , required : true , enum : ["padding_top" , "padding_left" , "padding_right" , "padding_bottom"]  },
    field_id :  { type : mongoose.Schema.Types.ObjectId , ref : "Fields" , required: true }
    
} , { timestamps : true })

export default mongoose.model("CardStyle" , card_style_schema);