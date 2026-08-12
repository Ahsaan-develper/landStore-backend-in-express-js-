import mongoose from "mongoose";

const card_data_schema = new mongoose.Schema({
        heading : { type : String , default : null},
        heading_color : { type : String , default : null},
        heading_alignment : { type : String , default : null},
        sub_heading : { type : String , default : null},
        sub_heading_color : { type : String , default : null},
        sub_heading_alignment : { type : String , default : null},
        description : { type : String , default : null},
        description_color : { type : String , default : null},
        description_alignment : { type : String , default : null},
} , { timestamps : true });

export default mongoose.model("CardData" , card_data_schema)