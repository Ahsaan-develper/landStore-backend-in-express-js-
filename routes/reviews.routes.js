import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { handleUserAuthError } from "../middleware/validators/errorHandler.validator.js";
import { reviews_page_validator, reviews_param_validator, reviews_update_validator, reviews_validator } from "../middleware/validators/review.validator.js";
import { add_review, delete_review, get_all_review, update_review } from "../controller/reviews.controller.js";


export const review_router = Router();

// create entity 

review_router.post("/" , verify_token ,authorize("admin") , reviews_validator ,  handleUserAuthError , add_review)

// get all entities 

review_router.get("/" , reviews_page_validator , get_all_review);

// update entity 

review_router.patch("/:id" , verify_token , authorize("admin") , reviews_update_validator , handleUserAuthError , update_review);

// delete an entity 

review_router.delete("/:id" , verify_token ,authorize("admin") , reviews_param_validator , handleUserAuthError , delete_review);