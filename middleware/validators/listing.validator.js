import { param , query, body } from "express-validator";


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

    body("sub_district_name")
        .notEmpty().withMessage("Sub-district is required").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("Sub-district too short"),

    body("district_name")
        .notEmpty().withMessage("District is required").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("District too short"),

    body("session")
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
            const valid = ["buy", "financing","jv"];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid deal types: ${invalid.join(", ")}`);
            return true;
        }),

    body("category")
        .notEmpty().withMessage("Category is required").bail()
        .isIn(["commercial", "industrial", "residential"]).withMessage("Invalid category"),

    body("state_name")
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




export const listing_radius_validator = [

    query("latitude")
        .notEmpty().withMessage("Latitude is required.").bail()
        .isFloat({ min: -90, max: 90 }).withMessage("Latitude must be between -90 and 90."),

    query("longitude")
        .notEmpty().withMessage("Longitude is required.").bail()
        .isFloat({ min: -180, max: 180 }).withMessage("Longitude must be between -180 and 180."),

    query("radius")
        .optional()
        .isFloat({ min: 1 }).withMessage("Radius must be a positive number."),

];



export const listing_page_validator = [
    body("page")
    .optional()
    .trim()
]

export const listing_id_validator = [
    param("id")
    .trim()
    .notEmpty().withMessage(" Listing id is required ")
    .isMongoId().withMessage(" Your id format is not correct ")
]




export const update_listing_validator = [
    // Required text fields
    body("unit")
        .optional()
        .notEmpty().withMessage("Unit is required").bail()
        .isIn(["sqft", "acres"]).withMessage("Unit must be sqft or acres").bail(),

    body("area")
    .optional()
        .notEmpty().withMessage("Area is required").bail()
        .isFloat({ min: 0 }).withMessage("Area must be a positive number"),

    body("public_description")
    .optional()
        .notEmpty().withMessage("Description is required").bail()
        .isLength({ min: 10, max: 2000 }).withMessage("Description must be 10-2000 characters"),

    body("price_sqft")
    .optional()
        .notEmpty().withMessage("Price is required").bail()
        .matches(/^\d+(\.\d{1,2})?$/).withMessage("Price must be a valid number"),

    body("is_malay_reserve_land")
    .optional()
        .notEmpty().withMessage("Malay reserve status is required").bail()
        .isIn(["true", "false", true, false]).withMessage("Must be true or false"),

    body("sub_district_name")
    .optional()
        .notEmpty().withMessage("Sub-district is required").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("Sub-district too short"),

    body("district_name")
    .optional()
        .notEmpty().withMessage("District is required").bail()
        .trim()
        .isLength({ min: 2 }).withMessage("District too short"),

    body("session")
    .optional()
        .notEmpty().withMessage("Section is required"),

    body("lot_number")
    .optional()
        .notEmpty().withMessage("Lot number is required"),

    body("tenure_type")
    .optional()
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
    .optional()
        .notEmpty().withMessage("Deal type is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            const valid = ["buy", "financing","jv"];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid deal types: ${invalid.join(", ")}`);
            return true;
        }),

    body("category")
    .optional()
        .notEmpty().withMessage("Category is required").bail()
        .isIn(["commercial", "industrial", "residential"]).withMessage("Invalid category"),

    body("state_name")
    .optional()
        .notEmpty().withMessage("State is required")
        .trim(),

    body("feature_tags")
        .optional()
    .notEmpty().withMessage("At least one feature tag is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            if (arr.length === 0) throw new Error("At least one feature tag required");
            if (arr.some(tag => tag.trim().length < 2)) throw new Error("Tags must be at least 2 characters");
            return true;
        }),

    body("terrain")
    .optional()
        .notEmpty().withMessage("Terrain is required")
        .custom((value) => {
            const arr = Array.isArray(value) ? value : [value];
            const valid = ["hilly", "mixed", "flat"];
            const invalid = arr.filter(v => !valid.includes(v));
            if (invalid.length > 0) throw new Error(`Invalid terrain: ${invalid.join(", ")}`);
            return true;
        }),

    body("relation")
    .optional()
        .notEmpty().withMessage("Relation is required").bail()
        .isIn([
            "i am agent for the property",
            "i am the owner the property",
            "My organization is the owner the property"
        ]).withMessage("Invalid relation"),

    body("utilization")
    .optional()
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



export const change_listing_status_admin_validator = [
    body("listing_id")
    .trim()
    .notEmpty().withMessage("Id is required").bail()
    .isMongoId().withMessage("Id format is not correct"),

    body("status")
    .trim()
    .notEmpty().withMessage(" Status is required").bail()
    .isIn(["active" ,"pending" ,"inactive" , "under_review" , "draft"]).withMessage(" Status must be active , inactive , under_review , draft , pending")
]