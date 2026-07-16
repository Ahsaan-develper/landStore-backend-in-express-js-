import { v2  as  cloudinary} from "cloudinary";
import { _config  } from "./env.config.js";

cloudinary.config({
    cloud_name : _config.CLOUDINARY_NAME,
    api_key  : _config.CLOUDINARY_API_KEY,
    api_secret : _config.CLOUDINARY_SECRET_KEY ,
    secure: true
})

export default cloudinary;