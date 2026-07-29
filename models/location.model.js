import mongoose from "mongoose";
const locationSchema = new mongoose.Schema({
    location: {
        coordinates: {
            type: [Number],
            required: true
        }
    },
    radius: {
        type: Number,
        default: null
    }
}, { timestamps: true });

locationSchema.index({ location: "2dsphere" });
export default mongoose.model("Location", locationSchema);