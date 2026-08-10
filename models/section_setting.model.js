import mongoose from "mongoose";

const section_setting_schema = new mongoose.Schema({
    name : { type : [String] , required : true , enum : ["button" , "container", "content" ] },
    state_section_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "StateSection"}

} , { timestamps : true })

export default mongoose.model("SectionSetting" ,section_setting_schema );