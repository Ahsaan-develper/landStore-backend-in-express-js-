import { param , body } from "express-validator";

export const make_schedule_validator = [
    body("enquiry_id")
    .trim()
    .notEmpty().withMessage("Please enter enquiry_id").bail()
    .isMongoId().withMessage("Enquiry id format is not correct"),

    body("notes")
    .trim()
    .notEmpty().withMessage(" Please write something in note"),

    body("visit_address")
    .trim()
    .notEmpty().withMessage("Please enter visit address "),

    body("visit_date")
    .trim()
    .notEmpty().withMessage(" Please enter visit date ")
    
]


export const status_schedule_validator = [
    param("schedule_id")
    .trim()
    .notEmpty().withMessage("Please enter schedule_id").bail()
    .isMongoId().withMessage("Schedule id format is not correct"),

    body("status")
    .trim()
    .notEmpty().withMessage(" Please select status")
    .isIn(["scheduled", "completed", "cancelled"]).withMessage(" Status must in scheduled completed cancelled")
]


export const get_schedule_validator = [
    param("schedule_id")
    .trim()
    .notEmpty().withMessage("Please enter schedule_id").bail()
    .isMongoId().withMessage("Schedule id format is not correct"),

]