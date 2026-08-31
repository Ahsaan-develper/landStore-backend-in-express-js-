import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { get_all_notifications, get_notification_data, get_single_notification, mark_all_notifications_as_read } from "../controller/notification.controller.js";
import { notification_id_validator } from "../middleware/validators/notification.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";


export const notification_router = Router();

// get all notifications

notification_router.get("/" , verify_token , authorize("individual" , "company" , "koperasi")  , get_all_notifications)


notification_router.get("/data/:notification_id" , verify_token , authorize("individual" , "company" , "koperasi") , notification_id_validator , HandleValidationError , get_notification_data)

// marks as read all
notification_router.patch("/" , verify_token , authorize("individual" , "company" , "koperasi")  , mark_all_notifications_as_read)

// get single notification 
notification_router.get("/:notification_id" , verify_token , authorize("individual" , "company" , "koperasi") , notification_id_validator , HandleValidationError  , get_single_notification)