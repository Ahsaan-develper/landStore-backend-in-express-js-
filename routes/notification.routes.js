import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { get_all_notifications, get_single_notification, mark_all_notifications_as_read } from "../controller/notification.controller.js";


export const notification_router = Router();

// get all notifications

notification_router.get("/" , verify_token , authorize("individual" , "company" , "keporasi")  , get_all_notifications)

// marks as read all
notification_router.patch("/" , verify_token , authorize("individual" , "company" , "keporasi")  , mark_all_notifications_as_read)

// get single notification 
notification_router.get("/:notification_id" , verify_token , authorize("individual" , "company" , "keporasi")  , get_single_notification)