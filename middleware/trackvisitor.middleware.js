import crypto from "crypto";
import listingActivityModel from "../models/listingActivity.model.js";
import visitorModel from "../models/visitor.model.js";
import mongoose from "mongoose";

function getClientIp(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) return forwarded.split(",")[0].trim();

    return req.socket?.remoteAddress || req.ip || "unknown";
}

function createBrowserSignature(req) {

    return crypto
        .createHash("sha256")
        .update(
            [
                req.headers["user-agent"] || "",
                req.headers["accept-language"] || "",
                req.headers["sec-ch-ua-platform"] || "",
                req.headers["sec-ch-ua-mobile"] || "",
                req.headers["sec-ch-ua"] || ""
            ].join("|")
        )
        .digest("hex");

}

export async function trackVisitor(req, res, next) {

    try {

        // Logged in user → no anonymous visitor tracking needed
        if (req.user) {
            return next();
        }

        const ip = getClientIp(req);

        const user_agent = req.headers["user-agent"] || "unknown";

        const browser_signature = createBrowserSignature(req);

        let visitor = null;

        const visitor_token = req.cookies?.visitor_token;

        // --------------------------
        // 1. Cookie
        // --------------------------

        if (visitor_token) {

            visitor = await visitorModel.findOne({
                visitor_token
            });

        }

        // --------------------------
        // 2. Browser signature
        // --------------------------

        if (!visitor) {

            visitor = await visitorModel.findOne({
                browser_signature
            });

        }

        // --------------------------
        // 3. IP + User-Agent
        // --------------------------

        if (!visitor) {

            visitor = await visitorModel.findOne({
                current_ip: ip,
                user_agent
            });

        }

        // --------------------------
        // Create visitor
        // --------------------------

        if (!visitor) {

            const token = crypto.randomUUID();

            visitor = await visitorModel.create({

                visitor_token: token,

                browser_signature,

                current_ip: ip,

                ip_history: [
                    {
                        ip
                    }
                ],

                user_agent,

                visit_count: 1

            });

            res.cookie("visitor_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 1000 * 60 * 60 * 24 * 365
            });

        } else {

            visitor.visit_count += 1;

            visitor.last_seen_at = new Date();

            // Save IP history
            if (visitor.current_ip !== ip) {

                visitor.current_ip = ip;

                const exists = visitor.ip_history.some(
                    x => x.ip === ip
                );

                if (!exists) {

                    visitor.ip_history.push({
                        ip
                    });

                }

            }

            await visitor.save();

        }

        req.visitor = visitor;

        next();

    } catch (err) {

        console.error("[trackVisitor]", err);

        next(err);

    }

}



const FIVE_HOURS = 1000 * 60 * 60 * 5;

export const trackListingView = async (req, res, next) => {
    try {

        const { id: listing_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(listing_id)) {
            return next();
        }

        let filter;

        // Logged in user
        if (req.user) {

            filter = {
                listing_id,
                user_id: req.user.sub
            };

        }
        // Visitor
        else {

            if (!req.visitor) {
                return next();
            }

            filter = {
                listing_id,
                visitor_id: req.visitor._id
            };

        }

        let activity = await listingActivityModel.findOne(filter);

        // First view
        if (!activity) {

            activity = await listingActivityModel.create({

                listing_id,

                user_id: req.user ? req.user.sub : null,

                visitor_id: req.user ? null : req.visitor._id,

                view_count: 1,

                click_count: 0,

                last_viewed_at: new Date()

            });

            req.listingActivity = activity;

            return next();

        }

        const now = Date.now();

        const shouldIncreaseView =
            !activity.last_viewed_at ||
            now - activity.last_viewed_at.getTime() >= FIVE_HOURS;

        if (shouldIncreaseView) {

            activity.view_count += 1;

            activity.last_viewed_at = new Date();

            await activity.save();

        }

        req.listingActivity = activity;

        next();

    } catch (err) {

        console.error("[trackListingView]", err);

        next(err);

    }

};



export const trackListingClick = async (req, res, next) => {
    try {

        const { id: listing_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(listing_id)) {
            return next();
        }

        let filter;

        if (req.user) {

            filter = {
                listing_id,
                user_id: req.user.sub
            };

        } else {

            if (!req.visitor) return next();

            filter = {
                listing_id,
                visitor_id: req.visitor._id
            };

        }

        let activity = await listingActivityModel.findOne(filter);

        if (!activity) {

            activity = await listingActivityModel.create({

                listing_id,

                user_id: req.user ? req.user.sub : null,

                visitor_id: req.user ? null : req.visitor._id,

                click_count: 1,

                view_count: 0,

                last_clicked_at: new Date()

            });

            req.listingActivity = activity;

            return next();

        }

        const shouldIncreaseClick =
            !activity.last_clicked_at ||
            Date.now() - activity.last_clicked_at.getTime() >= FIVE_HOURS;

        if (shouldIncreaseClick) {

            activity.click_count++;

            activity.last_clicked_at = new Date();

            await activity.save();

        }

        req.listingActivity = activity;

        next();

    } catch (err) {

        console.error("[trackListingClick]", err);

        next(err);

    }
};