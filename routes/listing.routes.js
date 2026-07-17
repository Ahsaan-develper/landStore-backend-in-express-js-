import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { change_listing_status_by_admin, create_listing, create_listing_draft, delete_listing, get_all_active_listing, get_all_draft, get_all_inactive_listing, get_all_listing, get_all_listing_by_admin, get_all_pending_listing, get_all_under_review_listing, get_filtered_listings, get_single_listing, update_draft } from "../controller/listing.controller.js";
import { upload_listing_files } from "../middleware/multer.middleware.js";
import { admin_listing_filter_validator, change_admin_listing_status_validator, create_listing_draft_validator, create_listing_validator, listing_page_validator, listing_param_validator, user_listing_filter_validator } from "../middleware/validators/listing.validator.js";
import { handleUserAuthError } from "../middleware/validators/errorHandler.validator.js";

export const listing_router = Router();

//  create published listing
listing_router.post("/" , verify_token , upload_listing_files , create_listing_validator  , handleUserAuthError, create_listing);

// create draft listing
listing_router.post("/draft" , verify_token , upload_listing_files,create_listing_draft_validator , handleUserAuthError , create_listing_draft);

// get all drafts 
listing_router.get("/draft" , verify_token, listing_page_validator , handleUserAuthError  , get_all_draft)

// get all listings
listing_router.get("/all" , verify_token , listing_page_validator , handleUserAuthError  , get_all_listing);

// get all pending listings
listing_router.get("/pending" , verify_token  , listing_page_validator , handleUserAuthError,get_all_pending_listing );

// get all inactive listings
listing_router.get("/inactive" , verify_token  , listing_page_validator , handleUserAuthError,get_all_inactive_listing );

// get all active listings
listing_router.get("/active" , verify_token  , listing_page_validator , handleUserAuthError,get_all_active_listing );

// get all under view listings
listing_router.get("/under/review" , verify_token  , listing_page_validator , handleUserAuthError,get_all_under_review_listing );

// get all by admin listings
listing_router.get("/admin" , verify_token   , authorize("admin"), admin_listing_filter_validator , handleUserAuthError , get_all_listing_by_admin );

// get all by user listings
listing_router.get("/user" , verify_token  , user_listing_filter_validator  , handleUserAuthError , get_filtered_listings );

// get a single listing 
listing_router.get("/:id" , listing_param_validator , handleUserAuthError , get_single_listing);

// update  a single listing 
listing_router.patch("/admin/:id"  , verify_token , authorize("admin"), change_admin_listing_status_validator , handleUserAuthError , change_listing_status_by_admin);

// update an draft 
listing_router.patch("/:id" , verify_token , upload_listing_files  ,  update_draft);

// delete an listing 
listing_router.delete("/:id" , verify_token , listing_param_validator , handleUserAuthError, delete_listing)