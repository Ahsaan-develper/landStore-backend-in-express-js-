import mongoose from "mongoose";


const passwordResetSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    token_hash: {
        type: String,
        required: true,
        unique: true
    },

    expires_at: {
        type: Date,
        required: true
    },

    used: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});


passwordResetSchema.index(
    { expires_at: 1 },
    { expireAfterSeconds: 0 }
);
export default mongoose.model(
    "PasswordReset",
    passwordResetSchema
);