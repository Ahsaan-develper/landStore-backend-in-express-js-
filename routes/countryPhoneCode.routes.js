import { Router } from "express";
import { countries_phone_codes } from "../controller/phone.controller.js";

export const country_code_router = Router();


// get all country code 

country_code_router.get("/" , countries_phone_codes)