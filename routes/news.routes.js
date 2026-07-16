import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { get_all_news_validator, newsUpdateValidator, newsValidator, params_news_validator } from "../middleware/validators/news.validator.js";
import { handleUserAuthError } from "../middleware/validators/errorHandler.validator.js";
import { upload_file_to_multer } from "../middleware/multer.middleware.js";
import { create_news, delete_news, draft_news, get_all_draft, get_all_news, get_single_news, publish_news, update_news } from "../controller/news.controller.js";


export const news_router = Router();

// create news 
news_router.post("/", verify_token , authorize("admin") , upload_file_to_multer.single("img") , newsValidator , handleUserAuthError  , create_news );

// get all news 

news_router.get("/" , get_all_news_validator , handleUserAuthError , get_all_news);

// get an single post in detail

news_router.get("/single/:id" , params_news_validator, handleUserAuthError , get_single_news)

// update news 
news_router.patch("/:id" , verify_token , authorize("admin") , upload_file_to_multer.single("img") , newsUpdateValidator, handleUserAuthError , update_news)

// draft a news
news_router.post("/draft" , verify_token , authorize("admin") , upload_file_to_multer.single("img") , newsUpdateValidator, handleUserAuthError , draft_news)

// draft posts get 

news_router.get("/draft", verify_token , authorize("admin") , get_all_news_validator , handleUserAuthError , get_all_draft);

// update draft to published
news_router.patch("/draft/:id", verify_token , authorize("admin") , params_news_validator , handleUserAuthError , publish_news);


// delete a news 

news_router.delete("/:id" , verify_token , authorize("admin") , params_news_validator , handleUserAuthError , delete_news  )