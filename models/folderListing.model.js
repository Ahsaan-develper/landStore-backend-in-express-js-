import mongoose from "mongoose";

const folderListingSchema = new mongoose.Schema({
  listing_id: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  folder_id: { type: mongoose.Schema.Types.ObjectId, ref: "Folder" },
}, { timestamps: true });
folderListingSchema.index({ folder_id : 1 , listing_id : 1 } , { unique : true })
export default mongoose.model("FolderListing", folderListingSchema);