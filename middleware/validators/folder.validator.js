import { param , body, query } from "express-validator";

export const create_folder_validator= [
    body("name")
    .trim()
    .notEmpty().withMessage("Please enter name of folder")
]

export const folder_id_validator= [
    param("folder_id")
    .trim()
    .notEmpty().withMessage("Please enter folder id ")
    .isMongoId().withMessage(" Folder id format not correct "),
]

export const folder_page_validator= [
    query("page")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter page number")
    .isInt().withMessage(" Please enter number "),
    query("limit")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter limit number")
    .isInt().withMessage(" Please enter number ")
]

export const add_listing_folder_validator= [
    body("listing_id")
    .trim()
    .notEmpty().withMessage("Please enter listing id ")
    .isMongoId().withMessage(" Listing id format not correct "),

    body("folder_id")
    .trim()
    .notEmpty().withMessage("Please enter folder id ")
    .isMongoId().withMessage(" Folder id format not correct "),
]