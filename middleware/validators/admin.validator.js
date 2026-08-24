import { param , body  , query} from "express-validator";


export const sub_admin_validator = [
    body("admin_role")
    .trim()
    .notEmpty().withMessage(" Please enter admin role ")
]


export const admin_status_validator = [
    param("user_id")
    .trim()
    .notEmpty().withMessage(" Please enter user_id  ").bail()
    .isMongoId().withMessage("Id format not correct "),

    body("status")
    .trim()
    .notEmpty().withMessage("Please enter status").bail()
    .isIn(["active" , "inactive" , "suspended"]).withMessage("Status must be active , inactive , suspended")
]

export const admin_change_role_validator = [
    param("admin_id")
    .trim()
    .notEmpty().withMessage(" Please enter admin_id  ").bail()
    .isMongoId().withMessage("Id format not correct "),

    body("role")
    .trim()
    .notEmpty().withMessage("Please enter role").bail()
    .isIn(["listing_admin" , "enquiry_admin" , "user_admin"]).withMessage("Role must be listing_admin , enquiry_admin , user_admin")
]

export const page_admin_validator = [
    query("page")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter page number "),

    query("limit")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter page number ")
]

