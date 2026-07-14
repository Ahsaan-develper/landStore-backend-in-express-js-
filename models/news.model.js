import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title : { type : String , required : true },
    img : { type : String , required : true },
    small_description : { type : String , required : true },
    description  : { type : String , required : true },
    admin_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "User"},
} , { timestamps : true })

export default mongoose.model("News" , newsSchema);