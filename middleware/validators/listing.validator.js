import { body , param } from "express-validator"
import mongoose from "mongoose";
import { BadRequestError } from "../error.middleware.js";



export const create_listing_validator = [
    // Required text fields
    body("unit")
        .notEmpty().withMessage("Unit is required").bail()
        .isIn(["sqft", "acres"]).withMessage("Unit must be sqft or acres").bail(),

    body("area")
        .notEmpty().withMessage("Area is required").bail()
        .isFloat({ min: 0 }).withMessage("Area must be a positive number"),

    body("public_description")
        .notEmpty().withMessage("Description is required").bail()
        .isLength({ min: 10, max: 2000 }).withMessage("Description must be 10-2000 characters"),

    body("price_sqft")
        .notEmpty().withMessage("Price is required").bail()
        .matches(/^\d+(\.\d{1,2})?$/).withMessage("Price must be a valid number"),

    body("is_malay_reserve_land")
        .notEmpty().withMessage("Malay reserve status is required").bail()
        .isIn(["true", "false", true, false]).withMessage("Must be true or false"),

    body("sub_district")
        .notEmpty().withMessage("Sub-district is required").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("Sub-district too short"),

    body("district")
        .notEmpty().withMessage("District is required").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("District too short"),

    body("section")
        .notEmpty().withMessage("Section is required"),

    body("lot_number")
        .notEmpty().withMessage("Lot number is required"),

    body("tenure_type")
    .notEmpty().withMessage("Tenure type is required").bail()
    .isIn(["freehold", "leasehold"]).withMessage("Must be freehold or leasehold")
    .custom((value, { req }) => {
        if (value === "leasehold") {
            if (!req.body.start_date) throw new Error("Start date required for leasehold");
            if (!req.body.end_year) throw new Error("End year required for leasehold");
        }
        return true;
    }),

    body("start_date")
        .optional()
        .isISO8601().withMessage("Invalid date format"),

    body("end_year")
        .optional()
        .isInt({ min: 0, max: 10 }).withMessage("Invalid year"),

    // Array fields (dealType, feature_tags, terrain)
    body("dealType")
        .notEmpty().withMessage("Deal type is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            const valid = ["buy", "financing","JV"];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid deal types: ${invalid.join(", ")}`);
            return true;
        }),

    body("category")
        .notEmpty().withMessage("Category is required").bail()
        .isIn(["commercial", "industrial", "residential"]).withMessage("Invalid category"),

    body("state")
        .notEmpty().withMessage("State is required")
        .trim(),

    body("feature_tags")
        .notEmpty().withMessage("At least one feature tag is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            if (arr.length === 0) throw new Error("At least one feature tag required");
            if (arr.some(tag => tag.trim().length < 2)) throw new Error("Tags must be at least 2 characters");
            return true;
        }),

    body("terrain")
        .notEmpty().withMessage("Terrain is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            const valid = ["hilly", "mixed", "flat"];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid terrain: ${invalid.join(", ")}`);
            return true;
        }),

    body("relation")
        .notEmpty().withMessage("Relation is required").bail()
        .isIn([
            "i am agent for the property",
            "i am the owner the property",
            "My organization is the owner the property"
        ]).withMessage("Invalid relation"),

    body("utilization")
        .notEmpty().withMessage("Utilization is required").bail()
        .isIn([
            "agriculture use",
            "commercial use",
            "industrial use",
            "occupied by myself",
            "occupied by squatters",
            "occupied by tenants",
            "vacant"
        ]).withMessage("Invalid utilization"),
];





export const create_listing_draft_validator = [
    // Required text fields
    body("unit")
        .notEmpty().withMessage("Unit is required").bail()
        .isIn(["sqft", "acres"]).withMessage("Unit must be sqft or acres").bail(),

    body("area")
        .notEmpty().withMessage("Area is required").bail()
        .isFloat({ min: 0 }).withMessage("Area must be a positive number"),

    body("public_description")
        .notEmpty().withMessage("Description is required").bail()
        .isLength({ min: 10, max: 2000 }).withMessage("Description must be 10-2000 characters"),

    body("price_sqft")
        .notEmpty().withMessage("Price is required").bail()
        .matches(/^\d+(\.\d{1,2})?$/).withMessage("Price must be a valid number"),

    body("is_malay_reserve_land")
        .notEmpty().withMessage("Malay reserve status is required").bail()
        .isIn(["true", "false", true, false]).withMessage("Must be true or false"),

    body("sub_district")
        .notEmpty().withMessage("Sub-district is required").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("Sub-district too short"),

    body("district")
        .notEmpty().withMessage("District is required").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("District too short"),

    body("section")
        .notEmpty().withMessage("Section is required"),

    body("lot_number")
        .notEmpty().withMessage("Lot number is required"),

    body("tenure_type")
    .notEmpty().withMessage("Tenure type is required").bail()
    .isIn(["freehold", "leasehold"]).withMessage("Must be freehold or leasehold")
    .custom((value, { req }) => {
        if (value === "leasehold") {
            if (!req.body.start_date) throw new Error("Start date required for leasehold");
            if (!req.body.end_year) throw new Error("End year required for leasehold");
        }
        return true;
    }),

    body("start_date")
        .optional()
        .isISO8601().withMessage("Invalid date format"),

    body("end_year")
        .optional()
        .isInt({ min: 0, max: 10 }).withMessage("Invalid year"),

    // Array fields (dealType, feature_tags, terrain)
    body("dealType")
        .notEmpty().withMessage("Deal type is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            const valid = ["buy", "financing","JV"];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid deal types: ${invalid.join(", ")}`);
            return true;
        }),

    body("category")
        .notEmpty().withMessage("Category is required").bail()
        .isIn(["commercial", "industrial", "residential"]).withMessage("Invalid category"),

    body("state")
        .notEmpty().withMessage("State is required")
        .trim(),

    body("feature_tags")
        .notEmpty().withMessage("At least one feature tag is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            if (arr.length === 0) throw new Error("At least one feature tag required");
            if (arr.some(tag => tag.trim().length < 2)) throw new Error("Tags must be at least 2 characters");
            return true;
        }),

    body("terrain")
        .notEmpty().withMessage("Terrain is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            const valid = ["hilly", "mixed", "flat"];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid terrain: ${invalid.join(", ")}`);
            return true;
        }),

    body("relation")
        .notEmpty().withMessage("Relation is required").bail()
        .isIn([
            "i am agent for the property",
            "i am the owner the property",
            "My organization is the owner the property"
        ]).withMessage("Invalid relation"),

    body("utilization")
        .notEmpty().withMessage("Utilization is required").bail()
        .isIn([
            "agriculture use",
            "commercial use",
            "industrial use",
            "occupied by myself",
            "occupied by squatters",
            "occupied by tenants",
            "vacant"
        ]).withMessage("Invalid utilization"),
];


export const admin_listing_filter_validator = [
    body("page")
        .optional()
        .trim()
        .isInt({ min: 1 }).withMessage("Page must be a positive number"),

    body("status")
        .optional()
        .trim()
        .toLowerCase()  // ← auto-convert to lowercase
        .isIn(["pending", "active", "inactive", "under review"])
        .withMessage("Invalid status"),

    body("category")
        .optional()
        .trim()
        .isIn(["commercial", "industrial", "residential"])
        .withMessage("Invalid category"),

    body("published_type")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(["draft", "published"])
        .withMessage("Invalid published_type")
];

export const listing_page_validator = [
    body("page")
        .optional()
        .trim()
        .isInt({ min: 1 }).withMessage("Page must be a positive number")
];





export const listing_param_validator = [
    param("id")
    .notEmpty().withMessage(" Page number is required ").bail()
    .trim()
    .custom(async( value )=>{
        if ( !mongoose.Types.ObjectId.isValid(value)) throw new BadRequestError(" Id format is not correct")
    })
]


export const change_admin_listing_status_validator = [
    param("id")
    .custom(async ( value)=>{
        if ( !mongoose.Types.ObjectId.isValid(value)) throw new BadRequestError(" Id format is not correct")
    }),

    body("status")
    .notEmpty().withMessage(" Status is required ").bail()
    .trim()
    .isIn(["pending" ,"active" , "inactive" ,"under review"]).withMessage("Status must be pending, active, inactive, or under review")
]



export const user_listing_filter_validator = [
    // Page (optional, defaults to 1)
    body("page")
        .optional()
        .trim()
        .isInt({ min: 1 }).withMessage("Page must be a positive number"),

    // Location - State
    body("state")
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage("Invalid state"),

    // District
    body("district")
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage("Invalid district"),

    // Deal Type - array or single
    body("dealType")
        .optional()
        .custom((value) => {
            const valid = ["buy", "financing", "jv"];
            const arr = Array.isArray(value) ? value : [value];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid deal types: ${invalid.join(", ")}`);
            return true;
        }),

    // Category - single
    body("category")
        .optional()
        .trim()
        .isIn(["commercial", "industrial", "residential"]).withMessage("Invalid category"),

    // Terrain - array or single
    body("terrain")
        .optional()
        .custom((value) => {
            const valid = ["flat", "hilly", "mixed"];
            const arr = Array.isArray(value) ? value : [value];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid terrain: ${invalid.join(", ")}`);
            return true;
        }),

    // Utilization - single
    body("utilization")
        .optional()
        .trim()
        .isIn([
            "agriculture use",
            "commercial use",
            "industrial use",
            "occupied by myself",
            "occupied by squatters",
            "occupied by tenants",
            "vacant"
        ]).withMessage("Invalid utilization"),

    // Malay Reserve Land - true, false, or "both"
    body("is_malay_reserve_land")
        .optional()
        .custom((value) => {
            const valid = [true, false, "both", "yes", "no"];
            if (!valid.includes(value)) throw new Error("Must be true, false, or both");
            return true;
        }),

    // Land Area Range
    body("minArea")
        .optional()
        .isFloat({ min: 0 }).withMessage("Min area must be a positive number"),

    body("maxArea")
        .optional()
        .isFloat({ min: 0 }).withMessage("Max area must be a positive number")
        .custom((value, { req }) => {
            if (req.body.minArea && Number(value) < Number(req.body.minArea)) {
                throw new Error("Max area must be greater than min area");
            }
            return true;
        }),

    body("areaUnit")
        .optional()
        .trim()
        .isIn(["acres", "sqft"]).withMessage("Unit must be acres or sqft"),

    // Price Range
    body("minPrice")
        .optional()
        .isFloat({ min: 0 }).withMessage("Min price must be positive"),

    body("maxPrice")
        .optional()
        .isFloat({ min: 0 }).withMessage("Max price must be positive")
        .custom((value, { req }) => {
            if (req.body.minPrice && Number(value) < Number(req.body.minPrice)) {
                throw new Error("Max price must be greater than min price");
            }
            return true;
        }),

    // Tenure Type
    body("tenure_type")
        .optional()
        .trim()
        .isIn(["freehold", "leasehold"]).withMessage("Invalid tenure type"),

    // Text Search
    body("search")
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage("Search must be 2-100 characters"),

    // Sorting
    body("sortBy")
        .optional()
        .trim()
        .isIn(["createdAt", "price", "area"]).withMessage("Sort by createdAt, price, or area"),

    body("sortOrder")
        .optional()
        .trim()
        .toLowerCase()
        .isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc")
];