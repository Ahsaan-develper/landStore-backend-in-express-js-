import mongoose from "mongoose";

const terrainTypeSchema = new mongoose.Schema({
  name: { type: [String], enum: ["hilly", "mixed" , "flat"] },
}, { timestamps: true });

export default mongoose.model("TerrainType", terrainTypeSchema);