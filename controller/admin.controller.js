
import { BadRequestError, ConflictError, InternalServerError, NotFoundError, UnAuthorizedError } from "../middleware/error.middleware.js";
import { generate_access_token, generate_refresh_token } from "../middleware/jwt.middleware.js";
import userModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import { deleteFromCloudinary, upload_to_cloudinary } from "../services/cloudinary.js";

// register an user 


export const register_admin = async (req, res) => {
    try {
        const { fullname, email, password, phone_number, country_phone_code, IC } = req.body;

        const hashed_password = await bcrypt.hash(password, 10);

        const new_user = await userModel.create({
            fullname,
            email,
            password: hashed_password,
            phone_number,
            country_phone_code,
            IC,
            role: "admin",
            active: true,
        });

        res.status(201).json({
            message: "User registered",
            name: new_user.fullname,
            email: new_user.email,
            role: new_user.role,
        });

    } catch (err) {
        throw new InternalServerError(err.message);
    }
};

// login user 
// export const login_admin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // single DB query
//         const user = await userModel.findOne({ email });

//         if (!user) throw new NotFoundError("Email not found");
//         if (user.active === false) throw new BadRequestError("Account is deactivated");

//         const is_match = await bcrypt.compare(password, user.password);
//         if (!is_match) throw new BadRequestError("Password is wrong");

//         const access_token = generate_access_token(user._id, user.role);
//         const refresh_token = generate_refresh_token(user._id, user.role);

//         user.refresh_token = refresh_token;
//         await user.save();

//         res.cookie("access_token", access_token, {
//             httpOnly: true,
//             maxAge: 5 * 60 * 60 * 1000           // 5 hours
//         });

//         res.cookie("refresh_token", refresh_token, {
//             httpOnly: true,
//             maxAge: 7 * 24 * 60 * 60 * 1000      // 7 days
//         });

//         res.status(200).json({
//             message: "Login successful",
//             name: user.fullname,
//             email: user.email,
//             role: user.role,
//         });

//     } catch (err) {
//         throw new InternalServerError(err.message);
//     }
// };


// // update an user 
// export const update_admin = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { fullname, email, phone_number, country_phone_code, IC, role,
//                 company_name, koperasi_name, SSM_registration_number, koperasi_reg_number } = req.body;

//         // build update fields
//         const update_fields = {};
//         if (fullname)             update_fields.fullname = fullname;
//         if (email)                update_fields.email = email;
//         if (phone_number)         update_fields.phone_number = phone_number;
//         if (country_phone_code)   update_fields.country_phone_code = country_phone_code;
//         if (IC)                   update_fields.IC = IC;
//         if (role)                 update_fields.role = role;
//         if (company_name)         update_fields.company_name = company_name;
//         if (koperasi_name)        update_fields.koperasi_name = koperasi_name;
//         if (SSM_registration_number) update_fields.SSM_registration_number = SSM_registration_number;
//         if (koperasi_reg_number)  update_fields.koperasi_reg_number = koperasi_reg_number;

//         if (req.file) {
         
//             const existing = await userModel.findById(id).select("img");
//             if (!existing) throw new NotFoundError("User not found");

//             // delete old image if exists
//             if (existing.img?.public_id) {
//                 await deleteFromCloudinary(existing.img.public_id);
//             }

//             const result = await upload_to_cloudinary(req.file.buffer, req.file.mimetype);
//             update_fields.img = { url: result.url, public_id: result.public_id };
//         }

//         const updated_user = await userModel.findByIdAndUpdate(
//             id,
//             { $set: update_fields },
//             { new: true, runValidators: false } 
//         );

//         if (!updated_user) throw new NotFoundError("User not found");

//         res.status(200).json({
//             message: "User updated successfully",
//             user: {
//                 id: updated_user._id,
//                 fullname: updated_user.fullname,
//                 email: updated_user.email,
//                 role: updated_user.role,
//                 img: updated_user.img?.url || null
//             }
//         });

//     } catch (err) {
//         throw new InternalServerError(err.message);
//     }
// };

// // delete an user 
// export const delete_admin = async (req, res) => {
//     const { id } = req.params;
//     if (!id) throw new BadRequestError("Id is required for delete user");

//  try {

//     const user = await userModel.findByIdAndUpdate(id ,{ $set : { active : false} } , { $unset : { img : 1 }});
//     if (user.img?.public_id) {
//         await deleteFromCloudinary(user.img.public_id);
//     }

//     res.status(200).json({
//         message: "User is deleted"
//     });
//  }catch( err ){
//     throw new InternalServerError( err );
//  }
    
// };