import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import { InternalServerError } from "../middleware/error.middleware.js";

export const upload_to_cloudinary = (buffer, mimetype) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder: "landstore" },
            (error, result) => {
                if (error) reject(new InternalServerError(error.message));
                else resolve({ url: result.secure_url, public_id: result.public_id });
            }
        );
        Readable.from(buffer).pipe(stream); // ✅ stream directly
    });
};

export const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (err) {
        throw new InternalServerError(err.message); // ✅ error handling added
    }
};