import dotenv from "dotenv";


dotenv.config();

export const _config = {
    PORT : process.env.PORT,
    MONGO_URL : process.env.MONGO_URL,
    CLOUDINARY_API_KEY : process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET_KEY : process.env.CLOUDINARY_SECRET_KEY,
    CLOUDINARY_NAME : process.env.CLOUDINARY_NAME,
    ACCESS_TOKEN : process.env.ACCESS_TOKEN,
    REFRESH_TOKEN : process.env.REFRESH_TOKEN,
    RESEND_API_KEY :  process.env.RESEND_API_KEY,
    EMAIL_APP_NAME :  process.env.EMAIL_APP_NAME,
    SENDING_EMAIL : process.env.SENDING_EMAIL,
    FRONTEND_URL : process.env.FRONTEND_URL
}
