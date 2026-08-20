import { _config } from "../config/envConfig.js";
import resend from "../config/resend.js";
import { passwordResetTemplate} from "../template/email.template.js";

export const sendPasswordResetEmail = async ({
    userEmail,
    resetUrl
}) => {

    const html = passwordResetTemplate({
        resetUrl,
        appName: _config.EMAIL_APP_NAME
    });


    const { data, error } = await resend.emails.send({

        from: _config.SENDING_EMAIL,

        to: userEmail,

        subject: "Reset your password",

        html
    });


    if (error) {

        console.error("Resend error:", error);

        throw new Error(
            "Failed to send password reset email"
        );
    }


    return data;
};

import { verifyEmailTemplate } from "../template/email.template.js";


export const sendVerificationEmail = async ({
    userEmail,
    userName,
    verifyUrl
}) => {

    try {

        const html = verifyEmailTemplate({
            verifyUrl,
            userName,
            appName: _config.EMAIL_APP_NAME
        });


        const { data, error } = await resend.emails.send({

            from: _config.SENDING_EMAIL,

            to: userEmail,

            subject: "Verify your email address",

            html

        });


        if (error) {

            console.error("Resend error:", error);

            throw new Error(
                "Failed to send verification email"
            );
        }


        return data;

    } catch (error) {

        console.error(
            "Verification email error:",
            error
        );

        throw error;
    }
};