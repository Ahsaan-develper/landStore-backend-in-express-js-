import jwt from "jsonwebtoken";
import { _config } from "../config/env.config.js";
import { isTokenBlacklisted } from "../utils/tokenBlackList.js";
import { ConflictError, ForbiddenError } from "./error.middleware.js";

// for access token 

export const  generate_access_token = (user_id , role)=>{
    
    return jwt.sign({sub : user_id.toString() , role : role }, _config.access_token , {expiresIn : "5h"}) ;
} 

// for refresh token 

export const generate_refresh_token = (user_id , role )=>{

    return jwt.sign({sub : user_id.toString() , role : role }, _config.refresh_token , {expiresIn : "7d"})
}

export const verify_token = async (req, res, next) => {
    let token = null;
    const authHeader = req.headers.authorization || req.cookies?.access_token;
if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.access_token) {
        token = req.cookies.access_token;
    }


    if (!token) {
        return res.status(401).json({ message: " token required for Authorization " });
    }
    if ( isTokenBlacklisted(token)) throw new ConflictError(" You are logout , Please login again")
    try {
        const decoded = jwt.verify(token, _config.access_token);
        
        req.user =  decoded;

        if (!req.user.role) {
            return res.status(403).json({ message: "Invalid token payload" });
        }


        next();

    } catch (err) {
             
        console.log("JWT Error:", err.name, "-", err.message);
        console.log("Token expired at:", new Date(jwt.decode(token)?.exp * 1000));
        console.log("Current time:", new Date());

        return res.status(403).json({ message: "Invalid or expired token" });
    }
};


// refresh handler 
// export const refresh_handler = async (req, res, next) => {
//     const refreshToken = req.cookies?.refreshToken;

//     if (!refreshToken) {
//         return res.status(401).json({ message: "No refresh token" });
//     }

//     try {
//         const decoded = jwt.verify(refreshToken, _config.refresh_token);
//         const userId = decoded.sub;
//         const userType = decoded.type || decoded.role;

//         let account;

//         account = await Admin.findById(userId);
        
//         if (!account) {
//             account = await User.findById(userId);
//         }

//         if (!account || account.refresh_token !== refreshToken) {
//             return res.status(401).json({ message: "Invalid refresh token" });
//         }

//         // Issue new tokens
//         const new_access_token = generate_access_token(account._id, account.role || 'user');
//         const new_refresh_token = generate_refresh_token(account._id, account.role || 'user');

//         account.refresh_token = new_refresh_token;
//         await account.save();

//         res.cookie("refreshToken", new_refresh_token, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             maxAge: 7 * 24 * 60 * 60 * 1000
//         });

//         return res.json({ 
//             access_token: new_access_token,
//             role: account.role || 'user'  // optional: send role for frontend routing
//         });

//     } catch (err) {
//         return res.status(401).json({ message: "Invalid refresh token or expired" });
//     }
// };



export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        

        if (!allowedRoles.includes(req.user.role)) {
            throw new ForbiddenError("Access denied");
        }
        next();
    };
};



export const optionalAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.accessToken;
   
    
    req.user = null;
    
    if (token) {
        try {
            const decoded = jwt.verify(token, _config.access_token);
            req.user = decoded;


        } catch (err) {
            // Invalid token, stay anonymous
        }
    }
    
    next();
};