import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  fullname: String,
  email: { type: String, unique: true },
  password: { type : String , required : true },
  status: { type: String, enum: ["inactive", "active", "suspended" ] },
  media_id: { type: mongoose.Schema.Types.ObjectId, ref: "Media" , default : null },
  user_code: { type: String, unique: true },
  role: { type: String, enum: ["individual", "company", "koperasi"] , default : null},
  is_verify: { type: Boolean, default: false },
  refresh_token: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("User", userSchema);