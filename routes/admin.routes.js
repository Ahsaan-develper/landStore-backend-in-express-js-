import { Router } from "express";
import { admin_login, change_admin_role_by_super_admin, change_user_status_by_admin, get_all_admins, get_all_users, get_user_by_admin_profile, sub_admin_register, super_admin_register } from "../controller/admin.controller.js";
import { user_id_validator, user_login_validator, user_profile_id_validator, user_register_validator } from "../middleware/validators/auth.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { admin_change_role_validator, admin_status_validator, page_admin_validator, sub_admin_validator } from "../middleware/validators/admin.validator.js";

export const admin_router = Router();


//  register super admin

admin_router.post("/super_admin" ,  user_register_validator , HandleValidationError , super_admin_register )


// login admin 

admin_router.post("/login" , user_login_validator , HandleValidationError , admin_login )

// get every user profile 

admin_router.get("/every_profile/:user_id" , verify_token , authorize("super_admin") , user_id_validator , HandleValidationError , get_user_by_admin_profile)

// get all users detail

admin_router.get("/all_user" , verify_token , authorize("super_admin" , "user_admin") , get_all_users);

// create sub admins 

admin_router.post("/sub_admin" , verify_token , authorize("super_admin") ,  user_register_validator , HandleValidationError , sub_admin_validator, sub_admin_register )


// change user status 
admin_router.patch("/change_status/:user_id" , verify_token , authorize("super_admin", "user_admin")  , admin_status_validator , HandleValidationError, change_user_status_by_admin);

// get all admin

admin_router.get("/all_admin" , verify_token , authorize("super_admin")  , page_admin_validator , HandleValidationError, get_all_admins)


admin_router.patch("/change_role/:admin_id" , verify_token , authorize("super_admin")  , admin_change_role_validator , HandleValidationError, change_admin_role_by_super_admin);