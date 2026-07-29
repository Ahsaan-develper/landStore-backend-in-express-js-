import { authorize, generate_access_token, generate_refresh_token } from "../middleware/jwt.middleware.js";
import mediaModel from "../models/media.model.js";
import koperasiModel from "../models/keporasiDetail.model.js";
import userDetailModel from "../models/userDetail.model.js";
import usersModel from "../models/users.model.js";
import { delete_file, upload_file } from "../services/cloudinary.service.js";
import { ConflictError, InternalServerError, NotFoundError, UnauthorizedError } from "../utils/error.utils.js"
import { add_to_blacklist } from "../utils/logout.utils.js";
import { user_code_generator } from "../utils/unique_code_generator.utils.js";
import bcrypt from "bcrypt";
import companyDetailsModel from "../models/companyDetails.model.js";
import mongoose from "mongoose";
export const user_register = async (req, res, next) => {
    try {
        const { fullname, email, password, phone_number, IC } = req.body;

        const existing_user = await usersModel.findOne({ email }).select("_id status").lean();
        if (existing_user) {
            if (existing_user.status === 'active') throw new ConflictError("User email already register");

            await usersModel.findByIdAndUpdate(
                existing_user._id,
                { $set: { status: 'active' } },
                { new: true }
            );
            
            return res.status(200).json({
                data: { message: "User account is reactivated !!!" }
            });
        }

        const [user_code, hashed_password, user_id] = await Promise.all([
            user_code_generator(),
            bcrypt.hash(password, 10),
            Promise.resolve(new mongoose.Types.ObjectId()) 
        ]);

        const [user] = await Promise.all([
            usersModel.create({
                _id: user_id,       
                fullname,
                email,
                password: hashed_password,
                status: "active",
                role: "individual",
                user_code
            }),
            userDetailModel.create({
                user_id,            
                phone_number,
                IC
            })
        ]);

        return res.status(201).json({
            data: {
                _id          : user._id,
                fullname     : user.fullname,
                email        : user.email,
                role         : user.role,
                phone_number,
                IC
            }
        });

    } catch (err) {
        next(err);
    }
};


export const keporasi_register = async ( req , res , next )=>{
    try{
        
        const { fullname, email, password, phone_number, IC , keporasi_name , keporasi_reg_number} = req.body;
        const existing_user = await usersModel.findOne({ email }).select("_id status").lean();
        if ( existing_user ){
            if( existing_user.status === "active") throw new ConflictError(" User already register with this email ");
            await usersModel.findByIdAndUpdate(existing_user._id , { $set : { status : "active"}} , { new : true });
            return res.status(200).json({
                data: { message: "User account is reactivated !!!" }
            });
        };

        const [ user_code , hashed_password , user_id ] = await Promise.all([
            user_code_generator(),
            bcrypt.hash(password, 10),
            Promise.resolve(new mongoose.Types.ObjectId())
        ]);
          const [user , keporasi , user_detail] = await Promise.all([
            usersModel.create({
                _id: user_id,
                fullname,
                email,
                password: hashed_password,
                status: "active",
                role: "keporasi",
                user_code
            }),
           
            koperasiModel.create({
                user_id,
                keporasi_name,
                keporasi_reg_number
            }),
             userDetailModel.create({
                user_id,
                phone_number,
                IC
            })
        ]);

        return res.status(201).json({
            data: {
                _id          : user._id,
                fullname     : user.fullname,
                email        : user.email,
                role         : user.role,
                keporasi_name : keporasi.keporasi_name
            }
        });

    }catch ( err ){
        next ( err );
    }
}


// company register 


export const company_register = async ( req , res , next )=>{
    try{
       
        
        const { fullname, email, password, phone_number, IC , company_name , SSM_reg_number} = req.body;
        const existing_user = await usersModel.findOne({ email }).select("_id status").lean();
        if ( existing_user ){
            if( existing_user.status === "active") throw new ConflictError(" User already register with this email ");
            await usersModel.findByIdAndUpdate(existing_user._id , { $set : { status : "active"}} , { new : true });
            return res.status(200).json({
                data: { message: "User account is reactivated !!!" }
            });
        };

        const [ user_code , hashed_password , user_id ] = await Promise.all([
            user_code_generator(),
            bcrypt.hash(password, 10),
            Promise.resolve(new mongoose.Types.ObjectId())
        ]);
          const [user , company , user_detail] = await Promise.all([
            usersModel.create({
                _id: user_id,
                fullname,
                email,
                password: hashed_password,
                status: "active",
                role: "company",
                user_code
            }),
           
            companyDetailsModel.create({
                user_id,
                company_name,
                SSM_reg_number
            }),
             userDetailModel.create({
                user_id,
                phone_number,
                IC
            })
        ]);

        return res.status(201).json({
            data: {
                _id          : user._id,
                fullname     : user.fullname,
                email        : user.email,
                role         : user.role,
                company_name : company.company_name
            }
        });

    }catch ( err ){
        next ( err );
    }
}
// login a user 

export const user_login = async ( req , res , next )=>{
    try {
        const { email , password } = req.body;
        const user = await usersModel.findOne({ email }).select("_id fullname email password role is_verify").lean();
        if ( !user ) throw new UnauthorizedError("Email is incorrect ");
        if ( !user.is_verify ) throw new UnauthorizedError("Please verify your email ");
        const is_match = await bcrypt.compare(password , user.password);
        if ( !is_match ) throw new UnauthorizedError("Password is incorrect ");
        const access_token = generate_access_token(user._id , user.role )
        const refresh_token = generate_refresh_token(user._id , user.role )
        res.cookie("refresh_token"  , refresh_token, {
            httpOnly : true ,
            maxAge : 7 * 24 * 60 * 60 * 1000
        });
         res.cookie("access_token"  , access_token, {
            httpOnly : true ,
            maxAge : 5 * 60 * 60 * 1000
        })
        user.refresh_token= refresh_token;
        await usersModel.findByIdAndUpdate(
            user._id,
            { $set: { refresh_token } },
            { new: true }
        );
        res.status(200).json({
            data : {
                message: "User is login ",
                _id : user._id,
                fullname : user.fullname,
                email : user.email
            }
        })
    }catch ( err ){
        next( err );
    }
}

// verify user 

export const verify_user_email = async ( req , res  , next)=>{
    try {
        const { user_id } = req.params;
        const user = await usersModel.findByIdAndUpdate( user_id, {$set : { is_verify : true }} , { new : true }  )
        if ( !user ) throw new NotFoundError(" User not found ");
        res.status(200).json({
            message : "User is verify by email "
        })
    }catch ( err ){
        next( err );
    }
}


// get user profile data
export const get_user_profile = async (req, res, next) => {
    try {
        const user_id =req.user.sub;

        // First fetch user alone — no point running other queries if user fails checks
        const user = await usersModel
            .findById(user_id)
            .select("_id fullname email role status is_verify media_id")
            .populate({ path: "media_id", select: "media_url media_type media_name" })
            .lean();

        if (!user)           throw new NotFoundError("User not found");
        if (!user.is_verify) throw new UnauthorizedError("User email is not verified");
        if (user.status !== "active") throw new UnauthorizedError("User account is inactive or suspended");

        const [user_detail, extra] = await Promise.all([
            userDetailModel
                .findOne({ user_id })
                .select("phone_number IC")
                .lean(),

            user.role === "company"
                ? companyDetailsModel
                    .findOne({ user_id })
                    .select("company_name SSM_reg_number")
                    .lean()
                : user.role === "keporasi"
                    ? koperasiModel
                        .findOne({ user_id })
                        .select("keporasi_name keporasi_reg_number")
                        .lean()
                    : null  // individual — skip query entirely
        ]);

        return res.status(200).json({
            data: {
                _id          : user._id,
                fullname     : user.fullname,
                email        : user.email,
                role         : user.role,
                status       : user.status,
                is_verify    : user.is_verify,
                media        : user.media_id ?? null,
                phone_number : user_detail?.phone_number ?? null,
                IC           : user_detail?.IC ?? null,
                ...(extra && user.role === "company"  && { company_details: extra }),
                ...(extra && user.role === "keporasi" && { keporasi_details: extra }),
            }
        });

    } catch (err) {
        next(err);
    }
};

// update an user 

export const update_user = async (req, res, next) => {
    try {
        const { user_id }      = req.params;
        const { phone_number } = req.body;


        const [user, user_detail] = await Promise.all([
            usersModel
                .findById(user_id)
                .select('_id media_id')
                .populate({ path: 'media_id', select: 'public_id media_url media_type media_name' })
                .lean(),
            userDetailModel
                .findOne({ user_id })
                .select('_id phone_number')
                .lean()
        ]);

        if (!user)        throw new NotFoundError("User not found");
        if (!user_detail) throw new NotFoundError("User detail not found");
        let user_detail_fields = {};
        let media_fields       = {};

        if (phone_number) user_detail_fields.phone_number = phone_number;

        if (req.file) {
            const existing_public_id = user.media_id?.public_id?.[0];

            if (existing_public_id) await delete_file(existing_public_id);

            const result = await upload_file(req.file.buffer, 'profile');

            media_fields = {
                media_url  : [result.url],
                public_id  : [result.public_id],
                media_type : ["image"],
                media_name : ["profile_img"]
            };
        }

        if (!Object.keys(user_detail_fields).length && !Object.keys(media_fields).length) {
            return res.status(200).json({ data: { message: "Nothing to update" } });
        }

        // run both in parallel
        const [updated_detail, updated_media] = await Promise.all([

            // update phone number
            Object.keys(user_detail_fields).length
                ? userDetailModel.findOneAndUpdate(
                    { user_id },
                    { $set: user_detail_fields },
                    { new: true, select: 'phone_number' }
                ).lean()
                : null,

            
            Object.keys(media_fields).length
                ? user.media_id
                    
                    ? mediaModel.findByIdAndUpdate(
                        user.media_id._id,
                        { $set: media_fields },
                        { new: true, select: 'media_url media_type media_name' }
                    ).lean()

                    : mediaModel.create(media_fields).then(async (media) => {
                        await usersModel.findByIdAndUpdate(
                            user_id,
                            { $set: { media_id: media._id } }
                        );
                        return media;
                    })
                : null
        ]);

        return res.status(200).json({
            data: {
                phone_number : updated_detail?.phone_number ?? user_detail.phone_number,
                media        : updated_media
            }
        });

    } catch (err) {
        next(err);
    }
};


// delete an user


export const delete_user = async (req, res, next) => {
    try {
        const { user_id } = req.params;
    
        const user = await usersModel
            .findById(user_id)
            .select('_id media_id refresh_token')
            .populate({ path: 'media_id', select: 'public_id _id' })
            .lean();

        if (!user) throw new NotFoundError("User not found");

        const public_id = user.media_id?.public_id?.[0]; 

        await Promise.all([
            usersModel.findByIdAndUpdate(
                user_id,
                { $set: { status: 'inactive' }, $unset: { media_id: 1 , refresh_token : 1}  }
            ),
            user.media_id?._id
                ? mediaModel.findByIdAndDelete(user.media_id._id) 
                : null,
            public_id
                ? await delete_file(public_id)
                : null
        ]);

        return res.status(200).json({ data: { message: "User deactivated and profile picture removed" } });

    } catch (err) {
         console.error("REAL ERROR:", err);
        next(err);
    }
};


// logout user
export const logout = async (req, res, next) => {
    try {
        const user_id = req.user.sub;
        const access_token = req.headers.authorization?.split(" ")[1] ?? null;

        await Promise.all([
            usersModel.findByIdAndUpdate(
                user_id,
                { $unset: { refresh_token: 1 } }
            ),
            access_token ? Promise.resolve(add_to_blacklist(access_token)) : null 
        ]);

        res.clearCookie('access_token');
        res.clearCookie('refresh_token');

        return res.status(200).json({
            data: { message: "Logged out successfully" }
        });

    } catch (err) {
        console.error(err);
        next(err);
    }
};