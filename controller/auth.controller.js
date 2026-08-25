import { authorize, generate_access_token, generate_refresh_token } from "../middleware/jwt.middleware.js";
import mediaModel from "../models/media.model.js";
import koperasiModel from "../models/keporasiDetail.model.js";
import userDetailModel from "../models/userDetail.model.js";
import usersModel from "../models/users.model.js";
import { delete_file, upload_file } from "../services/cloudinary.service.js";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/error.utils.js"
import { add_to_blacklist } from "../utils/logout.utils.js";
import { user_code_generator } from "../utils/unique_code_generator.utils.js";
import bcrypt from "bcrypt";
import companyDetailsModel from "../models/companyDetails.model.js";
import mongoose from "mongoose";
import { linkVisitorToUser } from "../utils/make_visitor_user.js";



import { request_email_verification, request_password_reset, update_password, verify_email } from "../services/auth.service.js";
export const user_register = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {

        const {
            fullname,
            email,
            password,
            phone_number,
            IC
        } = req.body;
        const existing_user = await usersModel
            .findOne({ email })
            .select("_id fullname email status is_verify")
            .lean();
        if (existing_user) {
            if (existing_user.status === "suspended") {
                throw new ForbiddenError("Your account has been suspended by admin");
            }
            if (
                existing_user.status === "active" && existing_user.is_verify === true
            ) {
                throw new ConflictError(
                    "User email already registered"
                );
            }
            if (existing_user.status !== "active") {
                await usersModel.findByIdAndUpdate(
                    existing_user._id,
                    {
                        $set: {
                            status: "active"
                        }
                    }
                );
            }
            if (existing_user.is_verify === false) {
                await request_email_verification({
                    userId: existing_user._id,
                    userEmail: existing_user.email,
                    userName: existing_user.fullname
                });
                return res.status(200).json({
                    data: {
                        message:
                            "Your email is not verified. A new verification link has been sent to your email."
                    }
                });
            }
            return res.status(200).json({
                data: {
                    message:
                        "User account has been reactivated."
                }
            });
        }
        const [
            user_code,
            hashed_password,
            user_id
        ] = await Promise.all([
            user_code_generator(),
            bcrypt.hash(password, 10),
            Promise.resolve(
                new mongoose.Types.ObjectId()
            )
        ]);
        session.startTransaction();
        const user = await usersModel.create(
            [
                {
                    _id: user_id,
                    fullname,
                    email,
                    password: hashed_password,
                    status: "active",
                    is_verify: false,
                    role: "individual",
                    user_code
                }
            ],
            {
                session
            }
        );
        await userDetailModel.create(
            [
                {
                    user_id,
                    phone_number,
                    IC
                }
            ],
            {
                session
            }
        );
        await session.commitTransaction();
        await linkVisitorToUser(
            req,
            user[0]._id
        );
        // Send verification email
        await request_email_verification({
            userId: user[0]._id,
            userEmail: user[0].email,
            userName: user[0].fullname
        });
        return res.status(201).json({
            data: {
                _id: user[0]._id,
                fullname: user[0].fullname,
                email: user[0].email,
                role: user[0].role,
                phone_number,
                IC,
                is_verify: false
            }
        });
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
    if (err.code === 11000) {
        if (err.keyPattern?.IC) {
            throw new ConflictError("This IC already exists");
        }
        if (err.keyPattern?.phone_number) {
            throw new ConflictError("This phone number already exists");
        }
        if (err.keyPattern?.email) {
            throw new ConflictError("This email already exists");
        }
        throw new ConflictError("Duplicate value already exists");
    }
        next(err);
    } finally {
        await session.endSession();
    }
};


export const keporasi_register = async (req, res, next) => {
    const session = await mongoose.startSession();

    try {
        const {
            fullname,
            email,
            password,
            phone_number,
            koperasi_name,
            koperasi_reg_number
        } = req.body;

        const existing_user = await usersModel
            .findOne({ email })
            .select("_id fullname email status is_verify")
            .lean();

        if (existing_user) {

            if (existing_user.status === "suspended") {
                throw new ForbiddenError(
                    "Your account has been suspended by admin"
                );
            }

            if (
                existing_user.status === "active" &&
                existing_user.is_verify === true
            ) {
                throw new ConflictError(
                    "User email already registered"
                );
            }

            if (existing_user.status === "inactive") {
                await usersModel.findByIdAndUpdate(
                    existing_user._id,
                    { $set: { status: "active" } }
                );
            }

            if (existing_user.is_verify === false) {
                await request_email_verification({
                    userId: existing_user._id,
                    userEmail: existing_user.email,
                    userName: existing_user.fullname
                });

                return res.status(200).json({
                    data: {
                        message:
                            "Your email is not verified. A new verification link has been sent to your email."
                    }
                });
            }

            return res.status(200).json({
                data: {
                    message: "User account has been reactivated."
                }
            });
        }

        const [user_code, hashed_password] = await Promise.all([
            user_code_generator(),
            bcrypt.hash(password, 10)
        ]);
        
        const user_id = new mongoose.Types.ObjectId();

        await session.withTransaction(async () => {

            await usersModel.create(
                [{
                    _id: user_id,
                    fullname,
                    email,
                    password: hashed_password,
                    status: "active",
                    is_verify: false,
                    role: "koperasi",
                    user_code
                }],
                { session }
            );

            await koperasiModel.create(
                [{
                    user_id,
                    koperasi_name,
                    koperasi_reg_number
                }],
                { session }
            );
            await userDetailModel.create(
                [{
                    user_id,
                    phone_number,
                }],
                { session }
            );
        });

        await linkVisitorToUser(req, user_id);

        await request_email_verification({
            userId: user_id,
            userEmail: email,
            userName: fullname
        });

        return res.status(201).json({
            data: {
                _id: user_id,
                fullname,
                email,
                role: "koperasi",
                phone_number,
                koperasi_name,
                koperasi_reg_number,
                is_verify: false
            }
        });

    } catch (err) {
        if (err.code === 11000) {
        if (err.keyPattern?.IC) {
            throw new ConflictError("This IC already exists");
        }
        if (err.keyPattern?.phone_number) {
            throw new ConflictError("This phone number already exists");
        }
        if (err.keyPattern?.email) {
            throw new ConflictError("This email already exists");
        }
        throw new ConflictError("Duplicate value already exists");
    }
        next(err);
    } finally {
        await session.endSession();
    }
};

// company register 
export const company_register = async (req, res, next) => {
    const session = await mongoose.startSession();
    try {
        const {
            fullname,
            email,
            password,
            phone_number,
            company_name,
            SSM_reg_number
        } = req.body;

        const existing_user = await usersModel
            .findOne({ email })
            .select("_id fullname email status is_verify")
            .lean();
        if (existing_user) {
            if (existing_user.status === "suspended") {
                throw new ForbiddenError("Your account has been suspended. Contact support.");
            }
            if (existing_user.status === "active" && existing_user.is_verify === true) {
                throw new ConflictError("User email already registered");
            }
            if (existing_user.status === "inactive") {
                await usersModel.findByIdAndUpdate(
                    existing_user._id,
                    { $set: { status: "active" } }
                );
            }

            if (existing_user.is_verify === false) {
                await request_email_verification({
                    userId: existing_user._id,
                    userEmail: existing_user.email,
                    userName: existing_user.fullname
                });
                return res.status(200).json({
                    data: {
                        message: "Your email is not verified. A new verification link has been sent to your email."
                    }
                });
            }

            return res.status(200).json({
                data: { message: "User account has been reactivated." }
            });
        }

        const [user_code, hashed_password, user_id] = await Promise.all([
            user_code_generator(),
            bcrypt.hash(password, 10),
            Promise.resolve(new mongoose.Types.ObjectId())
        ]);

        session.startTransaction();
        const [user, company] = await Promise.all([
            usersModel.create(
                [
                    {
                        _id: user_id,
                        fullname,
                        email,
                        password: hashed_password,
                        status: "active",
                        is_verify: false,
                        role: "company",
                        user_code
                    }
                ],
                { session }
            ),
            companyDetailsModel.create(
                [{ user_id, company_name, SSM_reg_number }],
                { session }
            ),
            userDetailModel.create(
                [{ user_id, phone_number }],
                { session }
            )
        ]);
        await session.commitTransaction();

        await linkVisitorToUser(req, user[0]._id);

        await request_email_verification({
            userId: user[0]._id,
            userEmail: user[0].email,
            userName: user[0].fullname
        });

        return res.status(201).json({
            data: {
                _id: user[0]._id,
                fullname: user[0].fullname,
                email: user[0].email,
                role: user[0].role,
                phone_number,
                company_name: company[0].company_name,
                SSM_reg_number: company[0].SSM_reg_number,
                is_verify: false
            }
        });
    } catch (err) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        if (err.code === 11000) {
        if (err.keyPattern?.IC) {
            throw new ConflictError("This IC already exists");
        }
        if (err.keyPattern?.phone_number) {
            throw new ConflictError("This phone number already exists");
        }
        if (err.keyPattern?.email) {
            throw new ConflictError("This email already exists");
        }
        throw new ConflictError("Duplicate value already exists");
    }
        next(err);
    } finally {
        await session.endSession();
    }
};// login a user 
export const user_login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await usersModel
            .findOne({ email })
            .select("_id fullname email password status role is_verify")
            .lean();

        if (!user) throw new UnauthorizedError("Invalid email or password");

        if (user.status === "suspended") {
            throw new ForbiddenError("Your account has been suspended. Contact support.");
        }

        if (user.status === "inactive") {
            throw new UnauthorizedError("Your account is inactive. Please register again to reactivate.");
        }

        if (!user.is_verify) {
            throw new UnauthorizedError("Please verify your email before logging in.");
        }

        const is_match = await bcrypt.compare(password, user.password);
        if (!is_match) throw new UnauthorizedError("Invalid email or password");

        const access_token = generate_access_token(user._id, user.role);
        const refresh_token = generate_refresh_token(user._id, user.role);

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            // secure: is_production,
            // sameSite: is_production ? "strict" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000   
        });

        res.cookie("access_token", access_token, {
            httpOnly: true,
            // secure: is_production,
            // sameSite: is_production ? "strict" : "lax",
            maxAge: 5 * 60 * 60 * 1000   
        });

        await usersModel.findByIdAndUpdate(
            user._id,
            { $set: { refresh_token } },
            { new: true }
        );

        await linkVisitorToUser(req, user._id);

        return res.status(200).json({
            data: {
                message: "Login successful",
                _id: user._id,
                fullname: user.fullname,
                email: user.email,
                role: user.role 
            }
        });
    } catch (err) {
        next(err);
    }
};

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

        const user = await usersModel
            .findById(user_id)
            .select("_id fullname email role status is_verify user_code media_id  ")
            .populate({ path: "media_id", select: "media_url public_id" })
            .lean();

        if (!user)           throw new NotFoundError("User not found");
        if (!user.is_verify) throw new UnauthorizedError("User email is not verified");
        if (user.status !== "active") throw new UnauthorizedError("User account is inactive or suspended");

        const [user_detail, extra] = await Promise.all([
            userDetailModel
                .findOne({ user_id })
                .select("phone_number IC ")
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
                    : null 
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
                ...(extra && user.role === "koperasi" && { keporasi_details: extra }),
            }
        });

    } catch (err) {
        next(err);
    }
};

// update an user
export const update_user = async (req, res, next) => {
    try {
        const { user_id } = req.params;
        const { phone_number } = req.body;
        const [user, user_detail] = await Promise.all([
            usersModel
                .findById(user_id)
                .select("_id media_id")
                .populate({
                    path: "media_id",
                    select: "public_id media_url media_type media_name"
                })
                .lean(),

            userDetailModel
                .findOne({ user_id })
                .select("_id phone_number")
                .lean()
        ]);

        if (!user) {
            throw new NotFoundError("User not found");
        }

        if (!user_detail) {
            throw new NotFoundError("User detail not found");
        }
            await userDetailModel.findOneAndUpdate(
                { user_id },
                { $set: { phone_number : phone_number } },
                { returnDocument : "after" }
            );
        let updated_media = null;

        if (req.file) {
            const result = await upload_file(
                req.file.buffer,
                "profile"
            );

            const media_data = {
                media_url: [result.url],
                public_id: [result.public_id],
                media_type: ["image"],
                media_name: ["profile_img"]
            };

            if (user.media_id) {
                updated_media = await mediaModel.findByIdAndUpdate(
                    user.media_id._id,
                    { $set: media_data },
                    { new: true }
                ).lean();

                const old_public_id = user.media_id.public_id?.[0];

                if (old_public_id) {
                    await delete_file(old_public_id);
                }

            } else {
                updated_media = await mediaModel.create(media_data);

                await usersModel.findByIdAndUpdate(
                    user_id,
                    {
                        $set: {
                            media_id: updated_media._id
                        }
                    },
                );
            }
        }

        return res.status(200).json({
            status: "success",
            data: {
                message: "User updated successfully"
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
// reset password

export const forget_password = async (req, res, next) => {

    try {

        const { email } = req.body;
        await request_password_reset(email);
        return res.status(200).json({
            success: true,
            message:
                "Password reset link has been sent, Please check your email."
        });

    } catch (err) {

        next(err);

    }
};


// update password after reset it 

export const reset_password = async (req, res, next) => {
    try {
        const { token, password } = req.body;
        await update_password(token, password);
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
    } catch (err) {
        next(err);
    }
};

// verify email 

export const user_verify_email= async (req, res, next) => {

    try {
        const { token } = req.query;
        await verify_email(token);
        return res.status(200).json({
            success: true,
            message: "Email verified successfully"
        });
    } catch (err) {
        next(err);
    }
};


