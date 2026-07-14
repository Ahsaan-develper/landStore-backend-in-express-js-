import mongoose from "mongoose";

const districtSchema = new mongoose.Schema({
    name : { type : String , required : true },
    admin_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref :"User" },
    state_id : { type : mongoose.Schema.Types.ObjectId , required : true  , ref : "State"},
} , { timestamps : true });

export default mongoose.Schema("District" , districtSchema);