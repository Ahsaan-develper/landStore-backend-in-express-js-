import { body, validationResult } from "express-validator";
import userModel from "../../models/user.model.js";
import { InternalServerError } from "../error.middleware.js";


export const validateRegister = [
    body("fullname")
        .optional()
        .trim()
        .notEmpty().withMessage("Full name is required").bail()
        .isLength({ min: 3, max: 50 }).withMessage("Name must be 3-50 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required").bail()
        .isEmail().withMessage("Invalid email format").bail()
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required").bail()
        .isLength({ min: 6 }).withMessage("Min 6 characters").bail()
        .matches(/[A-Z]/).withMessage("Must contain uppercase").bail()
        .matches(/[a-z]/).withMessage("Must contain lowercase").bail()
        .matches(/[0-9]/).withMessage("Must contain a number"),

    body("phone_number")
        .optional()
        .trim()
        .notEmpty().withMessage("Phone number is required").bail()
        .isMobilePhone().withMessage("Invalid phone number"),

    body("country_phone_code")
        .optional()
        .trim()
        .notEmpty().withMessage("Country code is required").bail()
        .matches(/^\+\d{1,4}$/).withMessage("Invalid country code (e.g. +60)"),

    body("IC")
        .optional()
        .trim()
        .notEmpty().withMessage("IC is required"),

    body("entity_type")
        .optional()
        .isArray().withMessage("entity_type must be an array"),
    body("company_name")
    .optional()
    .trim()
    .notEmpty().withMessage("Company name cannot be empty").bail()
    .isLength({ min: 3, max: 50 }).withMessage("Company name must be 3-50 characters"),

body("koperasi_name")
    .optional()
    .trim()
    .notEmpty().withMessage("Koperasi name cannot be empty").bail()
    .isLength({ min: 3, max: 50 }).withMessage("Koperasi name must be 3-50 characters"),

body("koperasi_reg_number")
    .optional()
    .trim()
    .notEmpty().withMessage("Koperasi registration number cannot be empty").bail()
    .isLength({ min: 3, max: 50 }).withMessage("Koperasi reg number must be 3-50 characters"),

body("SSM_registration_number")
    .optional()
    .trim()
    .notEmpty().withMessage("SSM registration number cannot be empty").bail()
    .isLength({ min: 3, max: 50 }).withMessage("SSM number must be 3-50 characters"),
];





// runs before validators, one query for all three
export const checkDuplicates = async (req, res, next) => {
    try {
        const { email, phone_number, IC } = req.body;

        const user = await userModel.findOne({
            $or: [{ email }, { phone_number }, { IC }]
        });

        if (user) {
            if (user.email === email && user.active === true)
                return res.status(409).json({ success: false, message: "Email already exists" });

            if (user.email === email && user.active === false)
                await userModel.findByIdAndUpdate( user._id , { $set : {active : true }});
                return res.status(200).json({
                message: "Account reactivated successfully",
                name: user.fullname,
                email: user.email,
                role: user.role,
            });

            if (user.phone_number === phone_number)
                return res.status(409).json({ success: false, message: "Phone number already exists" });

            if (user.IC === IC)
                return res.status(409).json({ success: false, message: "IC already exists" });
        }

        next();
    } catch (err) {
        throw new InternalServerError(err.message);
    }
};




export const login_user_validation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required").bail()
        .isEmail().withMessage("Invalid email format").bail()
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required").bail()
]



export const update_user_validation = [
     body("fullname")
        .optional()
        .trim()
        .notEmpty().withMessage("Full name is required").bail()
        .isLength({ min: 3, max: 50 }).withMessage("Name must be 3-50 characters"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email is required").bail()
        .isEmail().withMessage("Invalid email format").bail()
        .normalizeEmail(),

    body("phone_number")
        .optional()
        .trim()
        .notEmpty().withMessage("Phone number is required").bail()
        .isMobilePhone().withMessage("Invalid phone number"),

    body("country_phone_code")
        .optional()
        .trim()
        .notEmpty().withMessage("Country code is required").bail()
        .matches(/^\+\d{1,4}$/).withMessage("Invalid country code (e.g. +60)"),

    body("IC")
        .optional()
        .trim()
        .notEmpty().withMessage("IC is required"),
]