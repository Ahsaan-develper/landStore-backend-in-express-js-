import crypto from "crypto";

import usersModel from "../models/users.model.js";
import {sendPasswordResetEmail, sendVerificationEmail} from "./resend.service.js";
import resetPasswordModel from "../models/token.model.js";
import { BadRequestError, NotFoundError } from "../utils/error.utils.js";
import bcrypt from "bcrypt"
import { _config } from "../config/envConfig.js";

export const request_password_reset = async (email) => {
    const user = await usersModel
        .findOne({ email })
        .select("_id email")
        .lean();
    if (!user) {
        if ( !user ) throw new NotFoundError(" User not found ");
    }
    await resetPasswordModel.deleteMany({
        user_id: user._id
    });
    const rawToken = crypto
        .randomBytes(32)
        .toString("hex");
    console.log(rawToken);
    
    const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");
    const expiresAt = new Date(
        Date.now() + 2 * 60 * 1000
    );
    await resetPasswordModel.create({
        user_id: user._id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        used: false
    });
    const resetUrl = new URL(
        "/reset-password",
        _config.FRONTEND_URL
    );
    resetUrl.searchParams.set(
        "token",
        rawToken
    );
    await sendPasswordResetEmail({
        userEmail: user.email,
        resetUrl: resetUrl.toString()
    });
};

export const update_password = async (token, password) => {

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");
    const resetToken = await resetPasswordModel.findOne({
        token_hash: tokenHash,
        used: false
    });
    if (!resetToken) {
        throw new NotFoundError(
            "Invalid or expired reset link"
        );
    }
    if (resetToken.expires_at < new Date()) {
        await resetPasswordModel.deleteOne({
            _id: resetToken._id
        });
        throw new BadRequestError(
            "Reset link has expired"
        );
    }
    const user = await usersModel.findById(
        resetToken.user_id
    );
    if (!user) {
        await resetPasswordModel.deleteOne({
            _id: resetToken._id
        });
        throw new NotFoundError(
            "User not found"
        );
    }
    const hashedPassword = await bcrypt.hash(
        password,
        10
    );
    await usersModel.findByIdAndUpdate(
        user._id,
        {
            $set: {
                password: hashedPassword
            }
        }
    );
    await resetPasswordModel.deleteOne({
        _id: resetToken._id
    });
    return true;
};





export const request_email_verification = async ({
    userId,
    userEmail,
    userName
}) => {

    // Remove previous verification tokens
    await resetPasswordModel.deleteMany({

        user_id: userId,

        type: "email_verification"

    });


    // Generate raw token
    const rawToken = crypto
        .randomBytes(32)
        .toString("hex");


    // Hash token before storing
    const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");


    console.log(rawToken);
    
    const expiresAt = new Date(
        Date.now() + 1 * 60 * 60 * 1000
    );


    await resetPasswordModel.create({

        user_id: userId,

        token_hash: tokenHash,

        expires_at: expiresAt,

        used: false,

        type: "email_verification"

    });


    // Create verification URL
    const verifyUrl = new URL(
        "/verify-email",
        _config.FRONTEND_URL
    );


    verifyUrl.searchParams.set(
        "token",
        rawToken
    );


    // Send email
    await sendVerificationEmail({

        userEmail,

        userName,

        verifyUrl: verifyUrl.toString()

    });
};

export const verify_email = async (token) => {

    const tokenHash = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");


    const verificationToken =
        await resetPasswordModel.findOne({
            token_hash: tokenHash,
            used: false,
        });

    if (!verificationToken) {

        throw new NotFoundError(
            "Invalid or expired verification link"
        );

    }


    if (verificationToken.expires_at < new Date()) {

        await resetPasswordModel.deleteOne({
            _id: verificationToken._id
        });

        throw new BadRequestError(
            "Verification link has expired"
        );

    }


    // Mark email as verified
    await usersModel.findByIdAndUpdate(
        verificationToken.user_id,
        {
            $set: {
                is_verify: true
            }
        }
    );


    // Remove verification token
    await resetPasswordModel.deleteOne({
        _id: verificationToken._id
    });


    return true;
};