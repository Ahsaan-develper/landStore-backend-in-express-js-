import { upload_profile, upload_listing } from "../config/multer.js";

export const upload_profile_to_multer = (req, res, next) => {
    upload_profile(req, res, err => {
        if (err) return next(err);
        next();
    });
};

export const upload_listing_to_multer = (req, res, next) => {
    upload_listing(req, res, err => {
        if (err) return next(err);
        next();
    });
};