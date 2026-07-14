import mongoose from "mongoose";

const folderListingSchema = new mongoose.Schema({
    folder_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "Folder" },
    listing_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "Listing" },
} , { timestamps : true });
folderListingSchema.index({ folder_id : 1 , listing_id : 1 });
export default mongoose.model("FolderListing" , folderListingSchema);