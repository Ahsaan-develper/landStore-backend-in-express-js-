import mongoose from "mongoose";

const imagesSchema = new mongoose.Schema({
    img : { type : String , required : true },
    listing_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "Listing"},
} , { timestamps : true });
export default mongoose.model("Images" , imagesSchema);