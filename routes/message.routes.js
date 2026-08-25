import { Router } from "express";
import { get_enquiry_messages, send_message } from "../controller/message.controller.js";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { send_enquiry_message_validator } from "../middleware/validators/message.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";
import { upload_message_to_multer } from "../middleware/multer.middleware.js";

export const message_router = Router(); 

// send message by enquiry 

message_router.post("/send_enquiry_message"  , verify_token , authorize("company" , "koperasi" , "individual")  , upload_message_to_multer  , send_enquiry_message_validator , HandleValidationError, send_message)

// send message by admin
message_router.post("/send_enquiry_message_admin"  , verify_token , authorize("super_admin" , "enquiry_admin")  , upload_message_to_multer , send_message)

// get all messages of specific enquiry
message_router.get("/all_enquiry_message/:enquiry_id"  , verify_token , authorize("super_admin" , "enquiry_admin", "company" , "koperasi" , "individual")   , get_enquiry_messages)
