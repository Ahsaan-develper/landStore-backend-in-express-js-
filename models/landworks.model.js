import mongoose from "mongoose";

const landworkSchema = new mongoose.Schema({
    icon : { type : String , required : true },
    title : { type : String , required : true },
    description : { type : String , required : true },
    admin_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "User"},
} , { timestamps : true})

export default mongoose.model("LandWork" , landworkSchema);