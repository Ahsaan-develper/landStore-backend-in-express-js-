import mongoose from "mongoose";

const terrainTypeSchema = new mongoose.Schema({
  name: { type: [String], enum: ["hilly", "mixed"] },
}, { timestamps: true });

export default mongoose.model("TerrainType", terrainTypeSchema);