import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tenure_id: { type: mongoose.Schema.Types.ObjectId, ref: "TenureType" },
  location_id: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
  state_id: { type: mongoose.Schema.Types.ObjectId, ref: "State" },
  media_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "Media" }],
  deal_type_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "DealType" }],
  feature_tags_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "FeatureTag" }],
  terrain_id: [{ type: mongoose.Schema.Types.ObjectId, ref: "TerrainType" }],
  status: { type: String, enum: ["pending", "draft", "inactive", "active", "under_review" , "deactive"] },
  public_description:{ type : String , required : true},
  is_malay_reserve_land: { type : Boolean , required : true},
  listing_code: { type: String, unique: true },
  unit: { type: String, enum: ["sqft", "acres"] },
  area: { type : Number , required : true},
  price_sqft: { type : Number , required : true},
  category: { type: String, enum: ["commercial", "industrial", "residential"] },
  relation: { type: String, enum: ["i am agent for the property", "i am the owner the property", "My organization is the owner the property"] },
  utilization: { type: String, enum: ["agriculture use", "commercial use", "industrial use", "occupied by myself", "occupied by squatters", "occupied by tenants", "vacant"] },
}, { timestamps: true });
listingSchema.index({ user_id: 1, createdAt: -1 });

listingSchema.index({ state_id: 1 });
listingSchema.index({ location_id: 1 });
listingSchema.index({ media_id: 1 });
listingSchema.index({ feature_tags_id: 1 });
export default mongoose.model("Listing", listingSchema);