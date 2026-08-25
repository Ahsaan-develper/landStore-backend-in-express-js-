import mongoose from "mongoose";

const notesSchema = new mongoose.Schema({
    description : { type : String  },
    enquiry_id : { type :mongoose.Schema.Types.ObjectId , ref : "Enquiry"},
    listing_id : { type :mongoose.Schema.Types.ObjectId , ref : "Listing"},
} , { timestamps : true })
notesSchema.index({ enquiry_id :  1});
notesSchema.index({ listing_id :  1});
export default mongoose.model("Notes" , notesSchema)