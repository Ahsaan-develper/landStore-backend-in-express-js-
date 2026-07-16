import { body , param}  from "express-validator";
import mongoose from "mongoose";
import { BadRequestError } from "../error.middleware.js";


export const entity_validator = [
    param("id")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please provide id of entity").bail()
    .custom(async (value)=>{
        if ( !mongoose.Types.ObjectId.isValid( value )) throw new BadRequestError(" Id format is not correct ")
    }),
    body("name")
    .trim()
    .notEmpty().withMessage(" Name is required ").bail()
    .isLength({ min: 4  , max : 150}).withMessage(" Length od characters must be from 4 - 150")
]



export const entity_param_validator = [
    param("id")  
        .trim()
        .notEmpty().withMessage("Please provide id of entity").bail()
        .custom((value) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                throw new BadRequestError("Id format is not correct");
            }
            return true;
        })
]