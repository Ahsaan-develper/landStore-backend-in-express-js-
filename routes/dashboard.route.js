import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { get_active_listing_statistics, get_single_user_statistics, get_user_growth_statistics } from "../controller/dashboard.controller.js";


export const dashboard_router = Router();


dashboard_router.get("/get_all_users_data" , verify_token , authorize("super_admin" , "user_admin") , get_user_growth_statistics);


// active listings 
dashboard_router.get("/get_all_listings_data" , verify_token , authorize("super_admin" , "user_admin") , get_active_listing_statistics );


dashboard_router.get("/get_single_user_data" , verify_token , authorize("super_admin" , "user_admin") , get_single_user_statistics );