import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    title :{ type : String , required : true },
    message :{ type : String , required : true },
    read_at :{ type : Date  },
    user_id :{ type : mongoose.Schema.Types.ObjectId , required : true  , ref : "User"},
    listing_id :{ type : mongoose.Schema.Types.ObjectId   , ref : "Listing"  , default : null},
    interest_id :{ type : mongoose.Schema.Types.ObjectId  , ref : "Interest" , default : null},
} , { timestamps : true });

export default mongoose.model("Notification" , notificationSchema);