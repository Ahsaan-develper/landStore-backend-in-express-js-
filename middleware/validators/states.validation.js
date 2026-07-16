import { body } from "express-validator";

export const states_validator = [
    body("state")
    .trim()
    .notEmpty().withMessage(" State name is required").bail()
]