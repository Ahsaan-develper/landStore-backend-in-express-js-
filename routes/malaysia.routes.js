import { Router } from "express";
import { get_all_malaysia_state, get_all_malaysia_states_district } from "../controller/malaysia.controller.js";
import { states_validator } from "../middleware/validators/states.validation.js";
import { handleUserAuthError } from "../middleware/validators/errorHandler.validator.js";

export const malaysia_router = Router();

// get all malaysi astates data 

malaysia_router.get("/" , get_all_malaysia_state);

// get specific district 
malaysia_router.get("/district" , states_validator , handleUserAuthError , get_all_malaysia_states_district);