import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
    name : { type : String , required : true },
    user_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "User"},
} , { timestamps : true});
export default mongoose.model("Folder" , folderSchema);