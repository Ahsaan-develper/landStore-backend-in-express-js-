import mongoose from "mongoose";


const card_schema = new mongoose.Schema({
    content_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "ContentStyle" , },
    style_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "Style" , },
    card_category_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "CardCategory" , },
    card_data_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "CardData" , },
    card_name : {type : String  , required : true },
    date : {type : Date  , required : true },
    link: {type : String  , required : true },
    // media_id : {type : mongoose.Schema.Types.ObjectId  , default : null , ref: "Media"},
} , { timestamps : true })

export default mongoose.model("CardStyle" , card_schema);