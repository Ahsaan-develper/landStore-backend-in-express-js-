import { body , param , query } from "express-validator";


export const user_register_validator = [
    body("fullname")
    .trim()
    .notEmpty().withMessage(" Please fill your name ").bail()
    .isLength({ min : 4  , max: 40}).withMessage("Fullname characters length must be between 4 - 40 "),

    body("email")
    .trim()
    .notEmpty().withMessage("Please enter your email").bail()
    .isEmail().withMessage("Email format not correct ").bail()
    .isLength({min : 13 , max : 50}).withMessage(" Email characters length must between 13 to 50 "),

    body("password")
    .trim()
    .notEmpty().withMessage("Please enter you password").bail()
    .isLength({ min : 5 , max : 20}).withMessage("Password Length must between 5 - 20")
]


export const user_detail_validator = [
    body("phone_number")
    .trim()
    .notEmpty().withMessage("Please enter phone number").bail()
    .isMobilePhone().withMessage("Phone format not correct "),

    body("IC")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter IC number").bail()
    .isLength({min : 12 , max: 12}).withMessage("ID card character length must 12 ")
]

export const company_register_validator = [
    body("company_name")
    .trim()
    .notEmpty().withMessage("Please enter company name ").bail()
    .isLength({min : 5 , max : 30}).withMessage("Company name characters must between 5 - 30"),

    body("SSM_reg_number")
    .trim()
    .notEmpty().withMessage("Please enter SSM register Number")
]

export const Koperasi_register_validator = [

    body("keporasi_name")
    .trim()
    .notEmpty().withMessage("Please enter keporasi name ").bail()
    .isLength({min : 5 , max : 30}).withMessage("Koperasi name characters must between 5 - 30"),

    body("keporasi_reg_number")
    .trim()
    .notEmpty().withMessage("Please enter keporasi register Number")
]

export const user_login_validator = [
    body("email")
    .trim()
    .notEmpty().withMessage("Please enter your email").bail()
    .isEmail().withMessage("Email format not correct ").bail()
    .isLength({min : 13 , max : 50}).withMessage(" Email characters length must between 13 to 50 "),

    body("password")
    .trim()
    .notEmpty().withMessage("Please enter you password").bail()
    .isLength({ min : 5 , max : 20}).withMessage("Password Length must between 5 - 20")
]

export const update_user_validator = [
    param("user_id")
        .trim()
        .notEmpty().withMessage("User ID is required").bail()
        .isMongoId().withMessage("Invalid user ID"),

    body("phone_number")
    .optional()
    .trim()
    .notEmpty().withMessage("Please enter phone number").bail()
    .isMobilePhone().withMessage("Phone format not correct "),
]

export const user_id_validator = [
    param("user_id")
        .trim()
        .notEmpty().withMessage("User ID is required").bail()
        .isMongoId().withMessage("Invalid user ID")
];

export const user_profile_id_validator = [
    body("user_id")
        .optional()
        .trim()
        .notEmpty().withMessage("User ID is required").bail()
        .isMongoId().withMessage("Invalid user ID")
];