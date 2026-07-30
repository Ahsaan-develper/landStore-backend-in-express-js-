import { Router } from "express";
import { change_enquiry_status_by_user_validator, change_enquiry_status_validator, create_enquiry_validator, enquiry_id_validator } from "../middleware/validators/enquiry.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";
import { change_enquiry_status, create_enquiry, get_all_enquiry, get_all_enquiry_by_admin, get_single_enquiry } from "../controller/enquiry.controller.js";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";

export const enquiry_router = Router();

// create enquiry

enquiry_router.post("/" , verify_token , authorize("individual" , "company" , "keporasi") ,  create_enquiry_validator , HandleValidationError , create_enquiry)

// get all user enquiry 
enquiry_router.get("/all_enquiry" , verify_token , authorize("individual" , "company" , "keporasi")  , get_all_enquiry)

enquiry_router.get("/all_enquiry_admin" , verify_token , authorize("super_admin" , "enquiry_admin")  , get_all_enquiry_by_admin)

// change status
enquiry_router.patch("/enquiry_status_admin" , verify_token , authorize("super_admin" , "enquiry_admin")  , change_enquiry_status_validator , HandleValidationError , change_enquiry_status)

// change status by user to cancel
enquiry_router.patch("/enquiry_status_user" , verify_token , authorize("individual" , "company" , "keporasi")    , change_enquiry_status_by_user_validator , HandleValidationError , change_enquiry_status)


enquiry_router.get("/single_enquiry/:enquiry_id" , verify_token   , enquiry_id_validator , HandleValidationError , get_single_enquiry)