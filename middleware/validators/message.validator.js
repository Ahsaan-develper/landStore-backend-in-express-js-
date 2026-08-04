import { param , body } from "express-validator";

export const send_enquiry_message_validator = [
    body("enquiry_id")
    .trim()
    .notEmpty().withMessage(" Please provide an enquiry id ").bail()
    .isMongoId().withMessage(" enquiry id format not correct "),

    body("body")
    .optional()
    .trim()
    .notEmpty().withMessage(" Please enter message ").bail()
    .isLength({ max : 500}).withMessage(" Message character length must under 500")
]