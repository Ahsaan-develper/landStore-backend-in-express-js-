import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { content_statistic_update, create_browse_map_content, create_button, create_category, create_container, create_footer_content, create_menu_card, create_news, create_section, create_statistic_card, create_statistic_content, create_testimonial_card, get_all_section, get_browse_content, get_button, get_container, get_footer_content, get_news_content , get_news_section_user, get_reviews_content, get_single_cards, get_single_news_detail, get_single_testimonial_card, get_statistic_content, get_testimonial_content, section_active_inactive, single_menu_card, single_news_category_all_cards, state_container_data_updated, update_button } from "../controller/section.controller.js";
import {  card_data_validator, card_style_validator, create_button_validator, create_container_validator, create_menu_card_validator, create_news_category_validator, create_section_validator, create_statistic_card_validator, create_statistic_content_validator, create_testimonial_card_validator, news_card_validator, section_id_validator, section_padding_validator, section_query_id_validator } from "../middleware/validators/section.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";
import { upload_footer_logo_to_multer, upload_image_video, upload_img_to_multer } from "../middleware/multer.middleware.js";

export const section_router = Router();

// create section 

section_router.post("/" , verify_token ,authorize("super_admin" , "section_admin") , create_section_validator , HandleValidationError , create_section)

// get all sections 

section_router.get("/all_sections" , verify_token, authorize("super_admin" , "section_admin") , get_all_section);

// create container 

section_router.post("/container/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , section_padding_validator, create_container_validator, HandleValidationError ,create_container  )

// get container 
section_router.get("/container" , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError ,get_container  )

// create button
section_router.post("/button/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , create_button_validator, HandleValidationError ,create_button  )

// get button

section_router.get("/button" , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError ,get_button  )

// create content
section_router.post("/statistic/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , create_statistic_content_validator , HandleValidationError ,create_statistic_content  )

// get statistic content data 

section_router.get("/statistic_content" , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError ,get_statistic_content  )

// create statistic_card
section_router.post("/statistic_card/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , card_data_validator , card_style_validator , create_statistic_card_validator, HandleValidationError ,create_statistic_card  )

// get single cards 

section_router.get("/single_card" , verify_token , authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError , get_single_cards)

// create reviews content 
section_router.post("/reviews_content/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , create_statistic_content_validator, card_data_validator  , HandleValidationError ,create_statistic_content  )

// get reviews content
section_router.get("/reviews_content" , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError ,get_reviews_content  )

// testinomial content 
section_router.post("/testimonial_content/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , create_statistic_content_validator, card_data_validator  , HandleValidationError ,create_statistic_content  )

// get testinomial content 
section_router.get("/testimonial_content" , verify_token , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError , get_testimonial_content)

// create testimonial card 
section_router.post("/testimonial_card/:section_id" , verify_token , authorize("super_admin" , "section_admin") , create_testimonial_card_validator , card_style_validator , section_padding_validator ,  HandleValidationError, create_testimonial_card )

// get single testimonial card 
section_router.get("/testimonial_card" , verify_token , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError , get_single_testimonial_card)

// create browse map 
section_router.post("/browse_map/:section_id" , verify_token, authorize("super_admin" , "section_admin") , upload_image_video, section_id_validator, section_padding_validator , card_data_validator  , HandleValidationError ,create_browse_map_content  )

// create browse map data 
section_router.get("/browse_map" , verify_token , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator, HandleValidationError , get_browse_content)

// footer create 
section_router.post("/footer/:section_id" , verify_token, authorize("super_admin" , "section_admin") , upload_footer_logo_to_multer, section_id_validator , create_statistic_content_validator  , HandleValidationError , create_footer_content  )

// get footer content 
section_router.get("/footer" , verify_token , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator, HandleValidationError , get_footer_content)

// create menu card for footer 
section_router.post("/menu_card/:section_id" , verify_token ,  authorize("super_admin" , "section_admin") , section_id_validator , create_menu_card_validator , section_padding_validator, card_style_validator , HandleValidationError , create_menu_card )

// get single menu card 
section_router.get("/single_menu_card" , verify_token , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator, HandleValidationError , single_menu_card)

// create news content 
section_router.post("/news_content/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , create_statistic_content_validator, card_data_validator  , HandleValidationError ,create_statistic_content  )

// get news content 
section_router.get("/news_content" , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError ,get_news_content  )

// create news category 
section_router.post("/news_category/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , create_news_category_validator  , HandleValidationError ,create_category  )

// create news card 
section_router.post("/news/:section_id" , verify_token, authorize("super_admin" , "section_admin") ,  upload_img_to_multer ,  section_id_validator  , card_data_validator , section_padding_validator , card_style_validator , news_card_validator , HandleValidationError ,create_news  )

// get all cards of specific category 
section_router.get("/category_cards" , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError ,single_news_category_all_cards  )

//get just news card details m
section_router.get("/news_card" , verify_token, authorize("super_admin" , "section_admin") , section_query_id_validator , HandleValidationError ,get_single_news_detail  )

// get all news section cards 
section_router.get("/news_section/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , HandleValidationError , get_news_section_user  )



// update section status toggle 
section_router.patch("/section_status_toggle/:section_id" , verify_token , authorize("super_admin" , "section_admin"), section_id_validator ,section_active_inactive )

// update the container 
section_router.patch("/container/:section_id" , verify_token , authorize("super_admin" , "section_admin"), section_id_validator ,state_container_data_updated )

// updated button 
section_router.patch("/button/:section_id" , verify_token , authorize("super_admin" , "section_admin"), section_id_validator , update_button )

// update the content 
section_router.patch("/content/:section_id" , verify_token , authorize("super_admin" , "section_admin") , upload_image_video , section_id_validator ,  content_statistic_update)

// update content for just footer sections
section_router.patch("/footer/:section_id" , verify_token , authorize("super_admin" , "section_admin") ,upload_footer_logo_to_multer , section_id_validator ,  content_statistic_update)








