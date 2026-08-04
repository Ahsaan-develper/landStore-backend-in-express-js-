import { Router } from "express";
import { change_listing_status, create_listing, deactivate_listing, get_active_listings, get_all_listings_by_admin, get_all_views_count, get_draft_listings, get_inactive_listings, get_listing_by_radius, get_listing_by_user, get_pending_listings, get_single_listing, get_under_review_listings, make_draft_by_user, publish_listing, search_listings, update_listing } from "../controller/listing.controller.js";
import { authorize, optionalAuth, verify_token } from "../middleware/jwt.middleware.js";
import { upload_listing_to_multer } from "../middleware/multer.middleware.js";
import { change_listing_status_admin_validator, create_listing_validator, listing_id_validator, listing_page_validator, listing_radius_validator, update_listing_validator } from "../middleware/validators/listing.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";
import { trackVisitor , trackListingView, trackListingClick } from "../middleware/trackvisitor.middleware.js";

export const listing_router = Router();

// create listing 
listing_router.post("/" , verify_token ,authorize("individual" , "company" , "keporasi")  , upload_listing_to_multer , create_listing_validator , HandleValidationError, create_listing);


// make an draft 

listing_router.post("/draft" , verify_token ,authorize("individual" , "company" , "keporasi") , upload_listing_to_multer , make_draft_by_user)

// get all user listings
listing_router.get("/user_listing" , verify_token , listing_page_validator , HandleValidationError, get_listing_by_user )

// get all draft 
listing_router.get("/all_draft" , verify_token,authorize("individual" , "company" , "keporasi") , listing_page_validator , HandleValidationError, get_draft_listings )

// get all under review 
listing_router.get("/all_under_review" , verify_token,authorize("individual" , "company" , "keporasi") , listing_page_validator , HandleValidationError, get_under_review_listings )

// all active listings 
listing_router.get("/all_active" , verify_token , authorize("individual" , "company" , "keporasi") , listing_page_validator , HandleValidationError , get_active_listings)

// get all in active listingss 
listing_router.get("/all_inactive" , verify_token , authorize("individual" , "company" , "keporasi") , listing_page_validator , HandleValidationError , get_inactive_listings)
// get all pending listings
listing_router.get("/all_pending" , verify_token , authorize("individual" , "company" , "keporasi") , listing_page_validator , HandleValidationError , get_pending_listings)

// get all listings by admin
listing_router.get("/all" , verify_token , authorize("super_admin" , "listing_admin"), listing_page_validator , HandleValidationError , get_all_listings_by_admin)

// change status by admin
listing_router.patch("/status_admin" , verify_token  , authorize("super_admin" , "listing_admin"), change_listing_status_admin_validator , HandleValidationError , change_listing_status)

// apply filters 
listing_router.get("/search" , search_listings)

listing_router.get("/zoom_out" , listing_radius_validator , HandleValidationError, get_listing_by_radius)



listing_router.get("/total_count" , verify_token,authorize("individual" , "company" , "keporasi") , get_all_views_count)
// get single listing by id 

listing_router.get("/single/:id" , optionalAuth , trackVisitor , trackListingView , trackListingClick, listing_id_validator , HandleValidationError , get_single_listing)


// delete an listing
listing_router.delete("/deactived" , verify_token  ,authorize("individual" , "company" , "keporasi")   , deactivate_listing )


// update an listing 
listing_router.patch("/:id" , verify_token  ,authorize("individual" , "company" , "keporasi") , listing_id_validator  , upload_listing_to_multer ,  update_listing_validator , HandleValidationError , update_listing )

// punlished an listing 
listing_router.patch("/published/:id" , verify_token  ,authorize("individual" , "company" , "keporasi") , listing_id_validator  , HandleValidationError , publish_listing )