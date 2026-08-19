import mongoose from "mongoose";

const styleSchema = new mongoose.Schema({
    background_color : { type : String },
    border_color: { type : String},
    padding : {
        top: { type : String , default : null},
        bottom: {type : String , default : null},
        left: { type : String , default : null},
        right: { type : String , default : null},
    }
} , { timestamps : true })

export default mongoose.model("Style" , styleSchema);