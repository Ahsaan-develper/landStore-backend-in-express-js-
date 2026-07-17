import mongoose from "mongoose";

const imagesSchema = new mongoose.Schema({
    img : { 
        url : { type : String , required : true },
        public_id : { type : String , required : true }
    },
    listing_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "Listing"},
    type : { type : String , required : true }
} , { timestamps : true });
export default mongoose.model("Images" , imagesSchema);