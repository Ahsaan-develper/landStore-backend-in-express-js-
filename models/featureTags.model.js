import mongoose from "mongoose";

const featureTagsSchema = new mongoose.Schema({
    tag : { type : String , required : true },
    listing_id : { type : String , required : true  , ref : "Listing"},
} , { timestamps : true });


export default mongoose.model("Tags"  , featureTagsSchema);