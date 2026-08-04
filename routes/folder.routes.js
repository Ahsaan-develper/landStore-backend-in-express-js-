import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { add_listing_to_folder, create_folder, get_all_folder, get_folder_listings } from "../controller/folder.controller.js";
import { add_listing_folder_validator, create_folder_validator, folder_id_validator, folder_page_validator } from "../middleware/validators/folder.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";

export const folder_router = Router();


// create an folder 
folder_router.post("/" , verify_token , authorize("individual" , "company" , "keporasi") , create_folder_validator , HandleValidationError , create_folder);

folder_router.get("/" , verify_token , authorize("individual" , "company" , "keporasi") , folder_page_validator , HandleValidationError , get_all_folder);

// add listing into a folder 
folder_router.post("/add_listing" , verify_token , authorize("individual" , "company" , "keporasi")  , add_listing_folder_validator , HandleValidationError, add_listing_to_folder);


folder_router.get("/listings/:folder_id" , verify_token , authorize("individual" , "company" , "keporasi")  , folder_id_validator , HandleValidationError, get_folder_listings);