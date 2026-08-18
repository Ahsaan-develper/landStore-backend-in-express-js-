import mongoose from "mongoose";


const card_schema = new mongoose.Schema({
    content_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "ContentStyle" , },
    style_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "Style" , },
    card_category_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "CardCategory" , },
    card_data_id : { type : mongoose.Schema.Types.ObjectId , default : null , ref : "CardData" , },
    card_name : {type : String  , required : true },
    // date : {type : Date  , default : null},
    // link: {type : String  , default : null },
    is_deleted : { type : Boolean , default : false  },
    media_id : {type : mongoose.Schema.Types.ObjectId  , default : null , ref: "Media"},
} , { timestamps : true })

card_schema.index({style_id : 1 });
card_schema.index({ card_category_id : 1 });
export default mongoose.model("CardStyle" , card_schema);

