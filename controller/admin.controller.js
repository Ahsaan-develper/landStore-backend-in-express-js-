import bcrypt from "bcrypt";
import usersModel from "../models/users.model.js"
import mongoose from "mongoose";
import {user_code_generator} from "../utils/unique_code_generator.utils.js";
import adminModel from "../models/admin.model.js";
import { generate_access_token, generate_refresh_token } from "../middleware/jwt.middleware.js";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/error.utils.js";
import userDetailModel from "../models/userDetail.model.js";
import companyDetailsModel from "../models/companyDetails.model.js";
import keporasiDetailModel from "../models/keporasiDetail.model.js";
import { NotificationTemplates } from "../template/notification.template.js";
import { createAndSendNotification } from "../services/notification.service.js";

// register super admin
export const super_admin_register = async (req, res, next) => {
    try {
        const { fullname, email, password } = req.body;

        const existing_user = await usersModel
            .findOne({ email })
            .select("_id status")
            .lean();
        
        if (existing_user) {
            const existing_admin = await adminModel.findOne({ user_id: existing_user._id }).select("_id admin_role").lean();
            
            if( existing_admin?.admin_role === "super_admin") throw new ConflictError(" Super admin already create with this email ");
            const admin = await adminModel.create({
                user_id    : existing_user._id,
                admin_role : "super_admin",
                created_by : null
            });
            return res.status(201).json({
                data: {
                    user_id    : existing_user._id,
                    admin_role : admin.admin_role,
                    message    : "Super admin created for existing user"
                }
            });
        }

        
        const [hashed_password, user_id, user_code] = await Promise.all([
            bcrypt.hash(password, 10),
            Promise.resolve(new mongoose.Types.ObjectId()),
            user_code_generator()
        ]);

        const [user, admin] = await Promise.all([
            usersModel.create({
                _id      : user_id,
                fullname,
                email,
                password : hashed_password,
                status   : "active",
                user_code
            }),
            adminModel.create({
                user_id    : user_id,
                admin_role : "super_admin",
                created_by : null
            })
        ]);

        return res.status(201).json({
            data: {
                _id        : user._id,
                fullname   : user.fullname,
                email      : user.email,
                role       : user.role,
                admin_role : admin.admin_role
            }
        });

    } catch (err) {
        next(err);
    }
};




// super admin login
export const admin_login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await usersModel
            .findOne({ email })
            .select("_id fullname email password is_verify")
            .lean();

        if (!user)           throw new UnauthorizedError("Email is incorrect");
        if (!user.is_verify) throw new UnauthorizedError("Please verify your email");
        const [is_match, admin] = await Promise.all([
            bcrypt.compare(password, user.password),
            adminModel.findOne({ user_id: user._id }).select("admin_role").lean()
        ]);
        
        if (!is_match) throw new UnauthorizedError("Password is incorrect");
        if (!admin)    throw new UnauthorizedError("Admin record not found");

        const access_token  = generate_access_token(user._id, admin.admin_role);
        const refresh_token = generate_refresh_token(user._id, admin.admin_role);

       
        await usersModel.findByIdAndUpdate(user._id, { $set: { refresh_token } });

        res.cookie("refresh_token", refresh_token, {
            httpOnly : true,
            maxAge   : 7 * 24 * 60 * 60 * 1000
        });
        res.cookie("access_token", access_token, {
            httpOnly : true,
            maxAge   : 5 * 60 * 60 * 1000
        });

        return res.status(200).json({
            data: {
                message    : "Admin logged in",
                _id        : user._id,
                fullname   : user.fullname,
                email      : user.email,
                admin_role : admin.admin_role
            }
        });

    } catch (err) {
        next(err);
    }
};


//  register sun admins

export const sub_admin_register = async (req, res, next) => {
    try {
        const { fullname, email, password, admin_role } = req.body;
        const created_by = req.user.sub;

        const existing_user = await usersModel
            .findOne({ email })
            .select("_id admin_role")
            .lean();

        if (existing_user) {
            const existing_admin = await adminModel
        .findOne({ user_id: existing_user._id })
        .select("_id admin_role")
        .lean();
            if (existing_admin) throw new ConflictError("Admin already exists with this email");

            const admin = await adminModel.create({
                user_id    : existing_user._id,
                admin_role,
                created_by
            });

            return res.status(201).json({
                data: {
                    user_id    : existing_user._id,
                    admin_role : admin.admin_role,
                    created_by : admin.created_by,
                    message    : "Sub admin created for existing user"
                }
            });
        }

        const [hashed_password, user_id, user_code] = await Promise.all([
            bcrypt.hash(password, 10),
            Promise.resolve(new mongoose.Types.ObjectId()),
            user_code_generator()
        ]);

        const [user, admin] = await Promise.all([
            usersModel.create({
                _id      : user_id,
                fullname,
                email,
                password : hashed_password,
                status   : "active",
                user_code
            }),
            adminModel.create({
                user_id    : user_id,
                admin_role,
                created_by
            })
        ]);

        return res.status(201).json({
            data: {
                _id        : user._id,
                fullname   : user.fullname,
                email      : user.email,
                admin_role : admin.admin_role,
                created_by : admin.created_by
            }
        });

    } catch (err) {
        next(err);
    }
};




// get user profile data
export const get_user_by_admin_profile = async (req, res, next) => {
    try {
        const { user_id } = req.params;

        const user = await usersModel
            .findById(user_id)
            .select("_id fullname email role status is_verify media_id")
            .populate({ path: "media_id", select: "media_url media_type media_name" })
            .lean();

        if (!user)                    throw new NotFoundError("User not found");

        const is_admin = ["super_admin", "user_admin", ].includes(user.role);

        const [user_detail, extra, admin_detail] = await Promise.all([
            userDetailModel
                .findOne({ user_id })
                .select("phone_number IC")
                .lean(),

            user.role === "company"
                ? companyDetailsModel
                    .findOne({ user_id })
                    .select("company_name SSM_reg_number")
                    .lean()
                : user.role === "koperasi"
                    ? keporasiDetailModel
                        .findOne({ user_id })
                        .select("koperasi_name koperasi_reg_number")
                        .lean()
                    : null,

            is_admin
                ? adminModel
                    .findOne({ user_id })
                    .select("admin_role created_by")
                    .populate({ path: "created_by", select: "fullname email" })
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
                ...(admin_detail && { admin_details: admin_detail }),
            }
        });

    } catch (err) {
        next(err);
    }
};

// get all users
export const get_all_users = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1 , 1 )
        const limit =  Math.max(Number(req.query.limit) ||  10 , 1)
        const currentPage = Math.max(1, parseInt(page, 10) || 1);
        const safeSkip = (currentPage - 1) * limit;

        const [result] = await usersModel.aggregate([
            { $sort: { createdAt: -1, _id: -1 } },

            {
                $facet: {
                    data: [
                        { $skip: safeSkip },
                        { $limit: limit },

                        {
                            $lookup: {
                                from: "userdetails",
                                localField: "_id",
                                foreignField: "user_id",
                                as: "user_detail",
                                pipeline: [
                                    { $project: { phone_number: 1, IC: 1, _id: 0 } }
                                ]
                            }
                        },

                        {
                            $addFields: {
                                user_detail: { $first: "$user_detail" },
                            }
                        },

                        {
                            $project: {
                                password: 0,
                                refresh_token: 0,
                                __v: 0
                            }
                        }
                    ],

                    totalCount: [{ $count: "count" }]
                }
            },

            {
                $project: {
                    users: "$data",
                    totalCount: { $ifNull: [{ $arrayElemAt: ["$totalCount.count", 0] }, 0] }
                }
            }
        ]);

        const { users, totalCount } = result;
        const totalPages = Math.ceil(totalCount / limit);

        return res.status(200).json({
            success: true,
            data: users,
            pagination: {
                currentPage,
                limit,
                totalCount,
                totalPages,
                hasNextPage: currentPage < totalPages,
                hasPrevPage: currentPage > 1
            }
        });

    } catch (err) {
        next(err);
    }
};

// change user status
export const change_user_status_by_admin = async (req, res, next) => {
    try {

        const {  status } = req.body;
        const { user_id } = req.params ;
        const currentAdmin = req.user.role;
        const admin = await adminModel
            .findOne({ user_id })
            .select("_id admin_role")
            .lean();
        if (admin && currentAdmin !== "super_admin") {
            throw new ForbiddenError(
                "Only super admin can change another admin's status."
            );
        }
        const user = await usersModel.findByIdAndUpdate(
            new mongoose.Types.ObjectId(user_id),
            { $set: { status } },
            { returnDocument : "after"}
        ).select("_id fullname email status");
        if (!user) {
            throw new NotFoundError("User not found.");
        }
        let template;
        if (status === "suspended") {
            template = NotificationTemplates.accountSuspended();
        } else if (status === "active") {
            template = NotificationTemplates.accountActivated();
        }
    if (template) {

    const io = req.app.get("io");

    await createAndSendNotification(io, {
        user_id: user._id,
        notifiable_type: "Account",
        title: template.title,
        message: template.message
    });
}
        return res.status(200).json({
            message: "User status changed successfully.",
            user: {
                fullname: user.fullname,
                email: user.email,
                status: user.status
            }
        });
    } catch (err) {
        next(err);
    }
};

//  change admin role 
export const change_admin_role_by_super_admin = async ( req , res , next )=>{
    try {
        const {role} = req.body ;
        const {admin_id} = req.params;
        const current_admin = req.user.role;
        const admin = await adminModel.findById(admin_id).select(" admin_role ").lean();
        if ( !admin ) throw new NotFoundError("Admin not found ");
        if ( admin ){
            if ( current_admin !== "super_admin") throw new ForbiddenError(" Only super admin can change roles of other admins ");
        }
        const updated_admin =await adminModel.findByIdAndUpdate(admin_id , { $set : { admin_role : role }} , { new : true});
        res.status(200).json({
            message : "Admin role is changed",
            updated_admin
        })
    }catch ( err ){
        next ( err );
    }
}

// get all admins
export const get_all_admins = async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.max(Number(req.query.limit) || 10, 1);
        const skip = (page - 1) * limit;

        const result = await adminModel.aggregate([
            {
        $match: {
            admin_role: { $ne: "super_admin" } 
        }
    },
            {
                $facet: {
                    admins: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit },
                        {
                            $lookup: {
                                from: "users",
                                localField: "user_id",
                                foreignField: "_id",
                                as: "user"
                            }
                        },
                        { $unwind: "$user" },
                        {
                            $project: {
                                _id: 0,
                                admin_id: "$_id",
                                user_id: "$user._id",
                                fullname: "$user.fullname",
                                email: "$user.email",
                                status: "$user.status",
                                admin_role: 1,
                                createdAt: 1
                            }
                        }
                    ],
                    totalCount: [
                        {
                            $count: "count"
                        }
                    ]
                }
            }
        ]);
        const admins = result[0].admins;
        const totalCount = result[0].totalCount[0]?.count || 0;
        const totalPages = Math.ceil(totalCount / limit);

        res.status(200).json({
            message: "Admins fetched successfully.",
            page,
            totalPages,
            totalAdmins: totalCount,
            admins
        });

    } catch (err) {
        next(err);
    }
};