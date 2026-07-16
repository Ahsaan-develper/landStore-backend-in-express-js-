import dotenv from "dotenv";

dotenv.config();

export const _config = {
    PORT : process.env.PORT,
    MONGO_DB_STRING : process.env.MONGO_DB_STRING,
    access_token : process.env.ACCESS_TOKEN_SECRET,
    refresh_token : process.env.REFRESH_TOKEN_SECRET,
    CLOUDINARY_NAME : process.env.CLOUDINARY_NAME,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET_KEY : process.env.CLOUDINARY_SECRET_KEY
}