import { body , param} from "express-validator"
import mongoose from "mongoose"
import { BadRequestError } from "../error.middleware.js"

export const newsValidator = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required").bail()
        .isLength({ min: 10, max: 1000 }).withMessage("Title must be 10-1000 characters").bail()
        .matches(/[a-z]/).withMessage("Title must contain lowercase letters"),

    body("small_description")
        .trim()
        .notEmpty().withMessage("Small description is required").bail()
        .isLength({ min: 10, max: 2000 }).withMessage("Small description must be 10-2000 characters").bail()
        .matches(/[a-z]/).withMessage("Must contain lowercase letters"),

    body("description")
        .trim()
        .notEmpty().withMessage("Description is required").bail()
        .isLength({ min: 10, max: 3000 }).withMessage("Description must be 10-3000 characters").bail()
        .matches(/[a-z]/).withMessage("Must contain lowercase letters"),

    body("source")
        .trim()
        .notEmpty().withMessage("Source is required").bail()
        .isLength({ min: 3, max: 20 }).withMessage("Source must be 3-20 characters").bail()
        .matches(/[a-z]/).withMessage("Must contain lowercase letters"),

    body("type")
        .trim()
        .notEmpty().withMessage("Type is required").bail()
        .isLength({ min: 3, max: 20 }).withMessage("Type must be 3-20 characters").bail()
        .matches(/[a-z]/).withMessage("Must contain lowercase letters"),
];


export const newsUpdateValidator = [
    body("title")
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage("Title must be 10-1000 characters"),

    body("small_description")
        .optional()
        .trim()
        .isLength({ min: 10, max: 2000 }).withMessage("Small description must be 10-2000 characters"),

    body("description")
        .optional()
        .trim()
        .isLength({ min: 10, max: 3000 }).withMessage("Description must be 10-3000 characters"),

    body("source")
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage("Source must be 3-20 characters"),

    body("type")
        .optional()
        .trim()
        .isLength({ min: 3, max: 20 }).withMessage("Type must be 3-20 characters"),

];


export const get_all_news_validator = [
    body("page")
    .trim()
    .notEmpty().withMessage(" Page number is required ").bail()
    .matches(/[1-9]/)
]


export const params_news_validator =[
    param("id")
    .trim()
    .notEmpty(" Id must required ")
    .custom( async (value )=>{
        if( !mongoose.Types.ObjectId.isValid(value)) throw new BadRequestError(" Id format is not correct ")
    })
]