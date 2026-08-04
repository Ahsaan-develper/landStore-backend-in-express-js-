import visitorModel from "../models/visitor.model.js";
import listingActivityModel from "../models/listingActivity.model.js";

export const linkVisitorToUser = async (req, user_id) => {
    try {

        const visitor_token = req.cookies?.visitor_token;

        if (!visitor_token) {
            return;
        }

        const visitor = await visitorModel.findOne({
            visitor_token
        });

        if (!visitor) {
            return;
        }

        // Already linked
        if (visitor.user_id?.toString() === user_id.toString()) {
            return;
        }

        // Link visitor with user
        visitor.user_id = user_id;
        visitor.is_identified = true;

        await visitor.save();

        // Move all anonymous activities to logged in user
        await listingActivityModel.updateMany(
            {
                visitor_id: visitor._id,
                user_id: null
            },
            {
                $set: {
                    user_id
                }
            }
        );

    } catch (err) {
        console.error("linkVisitorToUser:", err);
    }
};