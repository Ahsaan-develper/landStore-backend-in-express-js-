import { Router } from "express";
import { change_schedule_status, get_enquiry_schedule, make_schedule } from "../controller/schedule.controller.js";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { get_schedule_validator, make_schedule_validator, status_schedule_validator } from "../middleware/validators/schedule.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";

export const schedule_router = Router();

// make schedule 
schedule_router.post("/" ,verify_token , authorize("super_admin" , "enquiry_admin") , make_schedule_validator , HandleValidationError , make_schedule)

// change status of schedule 
schedule_router.patch("/status" ,verify_token , authorize("super_admin" , "enquiry_admin") , status_schedule_validator , HandleValidationError , change_schedule_status)

// get schedule on an enquiry 
schedule_router.get("/:enquiry_id" ,verify_token , authorize("super_admin" , "enquiry_admin") , get_schedule_validator , HandleValidationError , get_enquiry_schedule)