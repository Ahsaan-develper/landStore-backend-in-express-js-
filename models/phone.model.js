import mongoose from "mongoose";

const phoneSchema = new mongoose.Schema({
    country_phone_code : {
        type : String , required : true 
    },
    country_name :{ type : String , required : true },
    country_ISO : { type : String , required : true },
    admin_id : { type : mongoose.Schema.Types.ObjectId , required : true , ref :"User" },

} , { timestamps : true })

export default mongoose.model("PhoneCode" , phoneSchema);