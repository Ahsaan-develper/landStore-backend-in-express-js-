import { Router } from "express";
import { company_register_validator, Koperasi_register_validator, update_user_validator, user_detail_validator, user_id_validator, user_login_validator, user_profile_id_validator, user_register_validator } from "../middleware/validators/auth.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";
import { company_register, delete_user, forget_password, get_user_profile, keporasi_register, logout, reset_password, update_user, user_login, user_register, user_verify_email, verify_user_email } from "../controller/auth.controller.js";
import { upload_img_to_multer } from "../middleware/multer.middleware.js";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";

export const auth_router = Router();


// register user 
auth_router.post("/" , user_register_validator , user_detail_validator , HandleValidationError , user_register)


// register keporasi

auth_router.post("/keporasi", user_register_validator  , Koperasi_register_validator, user_detail_validator , HandleValidationError , keporasi_register)



// register company

auth_router.post("/company", user_register_validator  , company_register_validator, user_detail_validator , HandleValidationError , company_register)

// user login 

auth_router.post("/login" , user_login_validator , HandleValidationError , user_login);

// user profile 

auth_router.get("/profile"  , verify_token , get_user_profile);


// verify user 

auth_router.post("/verify/:user_id"  , user_id_validator , HandleValidationError , verify_user_email)

// user logout 
auth_router.post("/logout" , verify_token, logout);

// reset the new password
auth_router.patch("/reset_new_password" , reset_password);
// verify email
auth_router.patch("/verify_email" , user_verify_email);
// update user 

auth_router.patch("/:user_id" , verify_token, update_user_validator , HandleValidationError , upload_img_to_multer,update_user);


// delete mean in active an user

auth_router.delete("/:user_id" , verify_token, user_id_validator , HandleValidationError , delete_user);

// send password reset  email 
auth_router.post("/forget_password" , forget_password);



