import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
    title : { type : String , required : true },
    img : { 
    url : {type : String , required : true},
    public_id : { type : String , required : true} 
    },
    small_description : { type : String , required : true },
    description  : { type : String , required : true },
    source : { type : String , required : true },
    type : { type : String , required : true },
    status : { type : String , required : true , enum : ["draft" , "published"] },
    admin_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "User"},
} , { timestamps : true })

export default mongoose.model("News" , newsSchema);