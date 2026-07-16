import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { delete_user, login_user, logout, register_user, update_user } from "../controller/user.controller.js";
import { upload_file_to_multer } from "../middleware/multer.middleware.js";
import { checkDuplicates, login_user_validation, validateRegister } from "../middleware/validators/Userauth.validator.js";
import { handleUserAuthError } from "../middleware/validators/errorHandler.validator.js";
import { params_news_validator } from "../middleware/validators/news.validator.js";


export const user_router = Router();

// register the user 
user_router.post("/"  , checkDuplicates, validateRegister  , handleUserAuthError, register_user);

// login a user 
user_router.get("/" , login_user_validation  , handleUserAuthError ,  login_user);

// update an user
user_router.patch("/:id"  , upload_file_to_multer.single("img"),  params_news_validator , handleUserAuthError ,  update_user);

// delete an user
user_router.delete("/:id"   , verify_token , authorize("admin" , "user") , params_news_validator , handleUserAuthError , delete_user);

// logout user 

user_router.get("/logout" , verify_token  , logout);