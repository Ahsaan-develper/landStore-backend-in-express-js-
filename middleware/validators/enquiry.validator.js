import { param , body } from "express-validator";

export const create_enquiry_validator = [
    body("listing_id")
    .trim()
    .notEmpty().withMessage(" Please provide an listing id ").bail()
    .isMongoId().withMessage(" Listing id format not correct "),

    body("interest_type")
    .trim()
    .notEmpty().withMessage(" Please enter interest_type ").bail()
    .isIn(["buy" , "rent" , "finance"]).withMessage(" Please choose one from buy , finance or rent "),

    body("estimated_budget")
    .trim()
    .notEmpty().withMessage("Please enter budget amount "),

    body("timeLine")
    .trim()
    .notEmpty().withMessage(" Please enter timeLine "),

    body("role")
    .trim()
    .notEmpty().withMessage("Please enter role")
    .isIn(["buyer" , "financier" , "developer" , "representative"]).withMessage("Please choose one role at a time ")
]


export const change_enquiry_status_validator = [

    param("enquiry_id")
        .trim()
        .notEmpty().withMessage("Enquiry id is required")
        .bail()
        .isMongoId().withMessage("Invalid enquiry id"),

    body("status")
        .trim()
        .notEmpty().withMessage("Status is required")
        .bail()
        .isIn([
            "pending",
            "cancel",
            "need_more_info",
            "in_progress",
            "scheduled",
            "under_review"
        ])
        .withMessage("Status must be pending, cancel , in_progress , need_more_info , scheduled or under_review")
];


export const change_enquiry_status_by_user_validator = [

    param("enquiry_id")
        .trim()
        .notEmpty().withMessage("Enquiry id is required")
        .bail()
        .isMongoId().withMessage("Invalid enquiry id"),

    body("status")
        .trim()
        .notEmpty().withMessage("Status is required")
        .bail()
        .isIn([
            "cancel",
        ])
        .withMessage("Status must be cancel")
];


export const enquiry_id_validator = [

    param("enquiry_id")
        .trim()
        .notEmpty().withMessage("Enquiry id is required")
        .bail()
        .isMongoId().withMessage("Invalid enquiry id"),
];