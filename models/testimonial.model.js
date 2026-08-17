import mongoose from "mongoose";

const testimonial_schema = new mongoose.Schema({
    testimonial : { type : String , required : true },
    testimonial_color : { type : String , required : true },
    testimonial_alignment : { type : String , required : true },
    customer : { type : String , required : true },
    customer_color : { type : String , required : true },
    customer_alignment : { type : String , required : true },
    testimonial_name : { type : String , required : true },
    username : { type : String , required : true },
    username_color : { type : String , required : true },
    username_alignment : { type : String , required : true },
    style_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "Style"},
    content_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "ContentStyle"},
} , { timestamps : true })

export default mongoose.model("testimonial" , testimonial_schema)