import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { delete_user, login_user, register_user, update_user } from "../controller/user.controller.js";
import { checkDuplicates, login_user_validation, validateRegister } from "../middleware/validators/Userauth.validator.js";
import { handleUserAuthError } from "../middleware/validators/errorHandler.validator.js";
import { upload_file_to_multer } from "../middleware/multer.middleware.js";
import { register_admin } from "../controller/admin.controller.js";
import { params_news_validator } from "../middleware/validators/news.validator.js";


export const admin_router = Router();

// register the user 
admin_router.post("/" ,  checkDuplicates ,  validateRegister , handleUserAuthError,   register_admin);

//login admin
admin_router.get("/"  , login_user_validation , handleUserAuthError, login_user)

//  update an admin 
admin_router.patch("/:id" , verify_token , authorize("admin")  , upload_file_to_multer.single("img") ,  update_user)

// delete an user 
admin_router.delete("/:id" , verify_token, authorize("admin") , params_news_validator , handleUserAuthError  , delete_user)