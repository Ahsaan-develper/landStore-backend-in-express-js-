import { param , query, body } from "express-validator";

export const notification_id_validator = [
    param("notification_id")
    .trim()
    .notEmpty().withMessage("Please enter notification id ").bail()
    .isMongoId().withMessage("Id format is not correct ")
]