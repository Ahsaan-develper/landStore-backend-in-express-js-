import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
    unit : { type : String , required : true , enum : [ "sqft" , "acres"] },
    area : { type : Number , required : true },
    public_description : { type : String , required : true },
    price_sqft : { type : String , required : true },
    is_malay_reserve_land : { type : Boolean , required : true , default : true },
    sub_district : { type : String , required : true },
    district : { type : String , required : true },
    section : { type : String , required : true },
    lot_number : { type : String , required : true },
    price : { type : String , required : true },
    tenure_type : { type : String , required : true , enum : ["freehold" , "leasehold"] },
    start_date : { type : Date , default : null}, 
    end_year : { type : Number , default : null },
    published_type : { type : String , enum: ["draft" , "published"]  , required : true },
    thumbnail : { 
        url : { type : String , required : true },
        public_id : { type : String , required : true },
    },
    
    status : { type : String , required : true  , default : "pending" , enum : ["pending" , "active" , "inactive" , "under review"]},
    latitude : { type : String , required : true },
    longitude : { type : String , required : true },
    location : { type : String , required : true },
    dealType : {    type : [String] , required : true  , enum : ["buy" , "financing", "jv"]},
    category : { type : String , required : true  , enum  : ["commercial" , "industrial" ,"residential"] },
    state : { type : String , required :   true },
    feature_tags : { type : [String] , required :   true  },
    terrain : { type : [String] , required : true  , enum: ["hilly" , "mixed" , "flat"] },
    user_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref : "User" },
    relation : { type : String , required : true , enum : ["i am agent for the property" , "i am the owner the property" , "My organization is the owner the property"] , default : "i am agent for the property"},
    utilization : { type : String , required : true , enum : ["agriculture use", "commercial use" , "industrial use" , "occupied by myself" , "occupied by squatters" , "occupied by tenants" , "vacant"] , default : "agriculture use"},
} , { timestamps : true });

// Add to listing schema
listingSchema.index({ published_type: 1, status: 1, createdAt: -1 });
listingSchema.index({ state: 1, district: 1 });
listingSchema.index({ dealType: 1 });
listingSchema.index({ category: 1 });
listingSchema.index({ price_sqft: 1 });
listingSchema.index({ area: 1, unit: 1 });
listingSchema.index({ terrain: 1 });
listingSchema.index({ is_malay_reserve_land: 1 });
listingSchema.index({ public_description: "text", location: "text", district: "text" });

export default  mongoose.model("Listing" , listingSchema);