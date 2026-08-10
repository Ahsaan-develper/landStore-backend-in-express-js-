import mongoose from "mongoose";

const container_style_schema = new mongoose.Schema({
    alignment : { type : String , required : true},
    background_color : { type : String , required : true},
    padding : { type : [String] , required : true , enum : ["padding_top" , "padding_left" , "padding_right" , "padding_bottom"]  },
    section_setting_id :  { type : mongoose.Schema.Types.ObjectId , ref : "SectionSetting" , required: true }
} , { timestamps : true });

export default mongoose.model("ContainerStyle" ,container_style_schema  )