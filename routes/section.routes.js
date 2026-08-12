import { Router } from "express";
import { authorize, verify_token } from "../middleware/jwt.middleware.js";
import { create_button, create_container, create_section, create_statistic_content, get_all_section } from "../controller/section.controller.js";
import {  create_button_validator, create_container_validator, create_section_validator, create_statistic_content_validator, section_id_validator, section_padding_validator } from "../middleware/validators/section.validator.js";
import { HandleValidationError } from "../middleware/validators/handleValidationError.js";

export const section_router = Router();

// create section 

section_router.post("/" , verify_token ,authorize("super_admin" , "section_admin") , create_section_validator , HandleValidationError , create_section)

// get all sections 

section_router.get("/all_sections" , verify_token, authorize("super_admin" , "section_admin") , get_all_section);

// create container 

section_router.post("/container/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , section_padding_validator, create_container_validator, HandleValidationError ,create_container  )

// create button
section_router.post("/button/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , create_button_validator, HandleValidationError ,create_button  )

// create content
section_router.post("/statistic/:section_id" , verify_token, authorize("super_admin" , "section_admin") , section_id_validator , create_statistic_content_validator, HandleValidationError ,create_statistic_content  )