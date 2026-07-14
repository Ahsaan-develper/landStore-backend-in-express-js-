import mongoose from "mongoose";

const entityUserSchema = new mongoose.Schema ({
    user_id : { type :  mongoose.Schema.Types.ObjectId , required : true , ref: "User"},
    entity_id : { type :  mongoose.Schema.Types.ObjectId , required : true , ref: "EntityType"},
} , { timestamps : true });

entityUserSchema.index({ user_id : 1 , entity_id :  1 });

export default mongoose.model("EntityUser" , entityUserSchema);