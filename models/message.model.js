import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  enquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: "Enquiry", default: null },
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  media_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
  body:{ type : String , required : true},
  is_read: { type : Boolean  , default : null},
  read_at: { type : Date , default : null},
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);