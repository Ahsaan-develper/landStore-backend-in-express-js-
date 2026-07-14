import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    unit : { type : String , required : true },
    area : { type : String , required : true },
    public_description : { type : String , required : true },
    price_sqft : { type : String , required : true },
    is_malay_reserve_land : { type : Boolean , required : true , default : true },
    sub_district : { type : String , required : true },
    section : { type : String , required : true },
    lot_number : { type : String , required : true },
    tenure_type : { type : String , required : true },
    start_date : { type : Date , default : null}, 
    end_year : { type : Number , default : null },
    geran_img : { type : String , required : true },
    status : { type : String , required : true },
    latitude : { type : String , required : true },
    longitude : { type : String , required : true },
    location : { type : String , required : true },
    dealType : { type : String , required : true  , enum : ["buy" , "financing"]},
    category : { type : String , required : true  , enum  : ["commercial" , "industrial" ,"residential"] },
    state : { type : String , required : true },
    terrain : { type : String , required : true  , enum: ["Hilly" , "Mixed"] },
    user_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "User" },
    relation : { type : String , required : true , enum : ["i am agent for the property" , "i am the owner the property" , "My organization is the owner the property"]},
    utilization : { type : String , required : true },
} , { timestamps : true });

export default  mongoose.model("Listing" , listingSchema);