import { Router} from "express";
import { checkDuplicates, login_user_validation, validateRegister } from "../middleware/validators/Userauth.validator.js";
import { handleUserAuthError } from "../middleware/validators/errorHandler.validator.js";
import { delete_user, login_user, update_user } from "../controller/user.controller.js";
import { upload_file_to_multer } from "../middleware/multer.middleware.js";
import { register_keropasi } from "../controller/keropasi.controller.js";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { params_news_validator } from "../middleware/validators/news.validator.js";


export const keropasi_router = Router();

// register an company

keropasi_router.post("/", checkDuplicates , validateRegister  , handleUserAuthError , register_keropasi  )

// login company 

keropasi_router.get("/" , login_user_validation , handleUserAuthError , login_user);

// update an company 

keropasi_router.patch("/:id" , verify_token , authorize("admin", "company") , upload_file_to_multer.single("img") , params_news_validator , handleUserAuthError , update_user);

// delete an company

keropasi_router.delete("/:id" , verify_token , authorize("admin" , "koperasi")  , params_news_validator , handleUserAuthError, delete_user);