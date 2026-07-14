import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname : { type : String  , required:  true },
    email : { type : String , required : true , unique : true },
    password : { type : String , required : true  },
    phone_number  : {type : String , required : true  , unique : true  },
    country_phone_code : { type : String , required : true },
    role : { type : String , required : true ,
        enum : ["admin" , "individual","company", "koperasi"]
    },
    IC : {type : String , required : true , unique : true },
    company_name : { type : String , required : true  },
    koperasi_name : { type : String , required : true },
    registration_number : { type : String , required : true },
} , { timestamps : true });

export default mongoose.model("User" , userSchema );