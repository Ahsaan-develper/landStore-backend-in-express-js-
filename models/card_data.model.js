import mongoose from "mongoose";

const card_data_schema = new mongoose.Schema({
        heading : { type : String },
        heading_color : { type : String },
        heading_alignment : { type : String },
        sub_heading : { type : String },
        sub_heading_color : { type : String },
        sub_heading_alignment : { type : String },
        description : { type : String},
        description_color : { type : String },
        description_alignment : { type : String },
} , { timestamps : true });

export default mongoose.model("CardData" , card_data_schema)