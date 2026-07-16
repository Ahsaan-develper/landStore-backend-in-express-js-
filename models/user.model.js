import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname : { type : String  , required:  true },
    email : { type : String , required : true , unique : true },
    password : { type : String , required : true  },
    phone_number  : {type : String , required : true  , unique : true  },
    country_phone_code : { type : String , required : true   , uppercase: true  },
    role : { type : String , required : true ,
        enum : ["admin" , "individual","company", "koperasi"]
    },
    IC : {type : String , required : true , unique : true },
    company_name : { type : String  , default : null},
    koperasi_name : { type : String , default : null },
    SSM_registration_number : { type : String , default : null   },
    koperasi_reg_number : { type : String  , default : null },
    img : {
        url : {type : String  , default : null},
        public_id : { type : String  , default : null}
    },
    active : { type : Boolean  , required : true  },
    is_verify : { type : String  , default : null },
    entity_type : { type : [String] , default : []},
    refresh_token : { type : String  , default : null  }
} , { timestamps : true });

export default mongoose.model("User" , userSchema );