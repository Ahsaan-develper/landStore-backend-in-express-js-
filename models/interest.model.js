import mongoose from "mongoose";

const interestSchema = new mongoose.Schema({
    interest_type : { type : String , required : true  , enum : ["buy", "financing" , "rent"] },
    estimated_budget : { type : Number , required : true },
    timeLine : { type : String , required : true },
    role : { type : String , required : true , enum : ["Financier" , "Buyer" , "Developer" , "Representative"]},
    message : { type : String , required : true },
    listing_id :  { type : mongoose.Schema.Types.ObjectId  , required : true , ref : "Listing" },
} , { timestamps : true })

export default mongoose.model("Interest" , interestSchema);