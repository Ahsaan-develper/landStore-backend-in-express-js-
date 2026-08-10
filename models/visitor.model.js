import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({

  
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      
    },

    visitor_token: {
        type: String,
        unique: true,
        sparse: true,
       
    },

    
    browser_signature: {
        type: String,
        required: true,
       
    },

    // Current IP
    current_ip: {
        type: String,
        required: true
    },

    // Previous IPs
    ip_history: [{
        ip: {
            type: String,
            required: true
        },
        first_seen: {
            type: Date,
            default: Date.now
        }
    }],

    // Browser details
    user_agent: {
        type: String,
        default: "unknown"
    },

    accept_language: {
        type: String,
        default: null
    },

    platform: {
        type: String,
        default: null
    },

    mobile: {
        type: Boolean,
        default: false
    },

    browser_brand: {
        type: String,
        default: null
    },

    // After login
    is_identified: {
        type: Boolean,
        default: false
    },

    visit_count: {
        type: Number,
        default: 1
    },

    last_seen_at: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});


visitorSchema.index({ browser_signature: 1 });
visitorSchema.index({ user_id: 1 });
visitorSchema.index({ current_ip: 1 });

export default mongoose.model("Visitor", visitorSchema);