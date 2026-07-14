import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    name : { type : String , required : true },
    username : { type : String , required : true },
    description : { type : String , required : true },
    admin_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "User"},
} , { timestamps : true });

export default mongoose.model("Reviews" , reviewSchema);