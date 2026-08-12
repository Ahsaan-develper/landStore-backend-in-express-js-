import mongoose from "mongoose";

const testinomial_schema = new mongoose.Schema({
    testinomial : { type : String , required : true },
    testinomial_color : { type : String , required : true },
    testinomial_alignment : { type : String , required : true },
    customer : { type : String , required : true },
    customer_color : { type : String , required : true },
    customer_alignment : { type : String , required : true },
    style_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "Style"},
    content_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "ContentStyle"},
} , { timestamps : true })

export default mongoose.model("Testinomial" , testinomial_schema)