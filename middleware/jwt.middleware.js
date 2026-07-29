import jwt, { decode } from "jsonwebtoken"
import { _config } from "../config/envConfig.js";
import { ForbiddenError, InternalServerError, NotFoundError } from "../utils/error.utils.js";
import usersModel from "../models/users.model.js";
import { is_blackList } from "../utils/logout.utils.js";

// for access token 

export const  generate_access_token = (user_id , role)=>{
    
    return jwt.sign({sub : user_id.toString() , role : role }, _config.ACCESS_TOKEN , {expiresIn : "5h"}) ;
} 

// for refresh token 

export const generate_refresh_token = (user_id , role )=>{

    return jwt.sign({sub : user_id.toString() , role : role }, _config.REFRESH_TOKEN , {expiresIn : "7d"})
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
        throw new NotFoundError("Token not given ")
    }
    try {
        const decoded = jwt.verify(token, _config.ACCESS_TOKEN);
        const blacklisted = await is_blackList(token);
        if (blacklisted) throw new ForbiddenError("Token is invalidated, please login again");
        const user = await usersModel.findById(decoded.sub).select("status").lean();
        if ( !user || user.status === "inactive" ) throw new ForbiddenError(" User is not login")
        req.user =  decoded;
        next();

    } catch (err) {
        next ( err );
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
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.access_token;
   
    
    req.user = null;
    
    if (token) {
        try {
            const decoded = jwt.verify(token, _config.ACCESS_TOKEN);
            req.user = decoded;
        } catch (err) {
            throw new InternalServerError( err );
        }
    }
    
    next();
};



