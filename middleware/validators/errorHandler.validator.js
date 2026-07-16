import { validationResult } from "express-validator";


// for register 
export const handleUserAuthError = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const first = errors.array()[0]; 
        return res.status(400).json({
            success: false,
            field: first.path,
            message: first.msg
        });
    }
    next();
};
