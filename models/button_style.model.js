import mongoose from "mongoose";

const button_style_schema = new mongoose.Schema({
    button_text : { type : String , required : true },
    text_color : { type : String , required : true },
    button_link : { type : String , required : true },
    background_color : { type : String , required : true },
    border_color : { type : String , required : true },
    padding : { type : [String] , required : true , enum : ["padding_top" , "padding_left" , "padding_right" , "padding_bottom"]  },
    section_setting_id :  { type : mongoose.Schema.Types.ObjectId , ref : "SectionSetting" , required: true }
    
} , { timestamps : true })

export default mongoose.model("ButtonStyle" ,button_style_schema )