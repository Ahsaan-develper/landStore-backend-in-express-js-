import mongoose from "mongoose";

const state_section_schema = new mongoose.Schema({
    route : { type : String , required : true},
    title :  { type : String , required : true},
    status :  { type : String , required : true , enum: ["active" , "inactive"]},
    description :  { type : String , required : true },
    admin_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "Admin"}
    
}, { timestamps : true })

export default mongoose.model("StateSection" , state_section_schema)