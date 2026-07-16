import { param , body } from "express-validator";
import mongoose from "mongoose";
import { BadRequestError } from "../error.middleware.js";


export const reviews_validator = [
    body("name")
    .trim()
    .notEmpty().withMessage(" Name is required").bail()
    .isLength( { min : 3 , max : 50}).withMessage("Characters length  of name between 3 to 50"),

    body("username")
    .trim()
    .notEmpty().withMessage(" Username is required").bail()
    .matches(/^@/)
    .isLength( { min : 3 , max : 50}).withMessage("Characters length  of username between 3 to 50"),

    body("description")
    .trim()
    .notEmpty().withMessage(" description is required").bail()
    .isLength( { min : 3 , max : 150}).withMessage("Characters length  of description between 3 to 150"),
]


export const reviews_update_validator = [
    param("id")
    .trim()
    .notEmpty().withMessage("Review Id must required ").bail()
    .custom(async ( value )=>{
        if ( !mongoose.Types.ObjectId.isValid( value )) throw new BadRequestError(" Id format is not correct ")
    }),

    body("name")
    .optional()
    .trim()
    .notEmpty().withMessage(" Name is required").bail()
    .isLength( { min : 3 , max : 50}).withMessage("Characters length  of name between 3 to 50"),

    body("username")
    .optional()
    .trim()
    .notEmpty().withMessage(" Username is required").bail()
    .matches(/^@/)
    .isLength( { min : 3 , max : 50}).withMessage("Characters length  of username between 3 to 50"),

    body("description")
    .optional()
    .trim()
    .notEmpty().withMessage(" description is required").bail()
    .isLength( { min : 3 , max : 150}).withMessage("Characters length  of description between 3 to 150"),
]


export const reviews_param_validator = [
    param("id")
    .trim()
    .notEmpty().withMessage("Review Id is required for delete").bail()
    .custom(async ( value )=>{
        if ( !mongoose.Types.ObjectId.isValid(value )) throw new BadRequestError(" Id format is wrong")
    })
]




export const reviews_page_validator = [
    body("page")
    .trim()
    .notEmpty().withMessage("Review page number is required for delete").bail()
    .toInt().withMessage(" page number must be int")
]
