import mongoose, { mongo } from "mongoose";

const categorySchema = new mongoose.Schema({
    name : { type : String , required : true },
    admin_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "User"},
} , { timestamps : true });

export default mongoose.model("Category" , categorySchema);