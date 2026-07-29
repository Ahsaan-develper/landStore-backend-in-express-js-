import multer from "multer";
import { BadRequestError } from "../utils/error.utils.js";

const IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
];

const DOCUMENT_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
];

// ---------------- Profile Upload ----------------

const profileMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter(req, file, cb) {
        if (!IMAGE_TYPES.includes(file.mimetype)) {
            return cb(new BadRequestError("Only images are allowed."));
        }
        cb(null, true);
    }
});

export const upload_profile = profileMulter.single("profile_image");



const listingMulter = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10 MB per file
    }
});

export const upload_listing = listingMulter.fields([
    {
        name: "property_images",
        maxCount: 15
    },
    {
        name: "geran_doc",
        maxCount: 11
    }
]);