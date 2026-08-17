import { upload_profile, upload_listing, upload_message_files, upload_image_video_multer, upload_footer } from "../config/multer.js";

export const upload_img_to_multer = (req, res, next) => {
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


export const upload_message_to_multer = (req, res, next) => {
    upload_message_files(req, res, err => {
        if (err) return next(err);
        next();
    });
};

export const upload_footer_logo_to_multer = (req, res, next) => {
    upload_footer(req, res, err => {
        if (err) return next(err);
        next();
    });
};

import multer from "multer";

export const upload_image_video = (req, res, next) => {
  upload_image_video_multer.single("file")(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return next(new Error("File too large — max 50MB"));
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return next(new Error("Only one file allowed"));
      }
    }
    if (err) return next(err);
    next();
  });
};