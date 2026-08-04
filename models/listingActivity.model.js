import mongoose from "mongoose";

const listingActivitySchema = new mongoose.Schema(
    {
        listing_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
            
        },

        // Logged-in user
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },

        // Guest visitor
        visitor_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Visitor",
            default: null
        },

        view_count: {
            type: Number,
            default: 0,
            min: 0
        },

        click_count: {
            type: Number,
            default: 0,
            min: 0
        },

        last_viewed_at: {
            type: Date,
            default: null
        },

        last_clicked_at: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);
listingActivitySchema.pre("validate", function () {
    if (!this.user_id && !this.visitor_id) {
        throw new Error("Either user_id or visitor_id is required.");
    }
});


listingActivitySchema.index(
    {
        visitor_id: 1,
        listing_id: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            visitor_id: {
                $exists: true,
                $ne: null
            }
        }
    }
);

/**
 * Logged-in user can only have one activity document per listing.
 */
listingActivitySchema.index(
    {
        user_id: 1,
        listing_id: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            user_id: {
                $exists: true,
                $ne: null
            }
        }
    }
);

listingActivitySchema.index({
    last_viewed_at: -1
});

listingActivitySchema.index({
    last_clicked_at: -1
});

export default mongoose.model("ListingActivity", listingActivitySchema);