export const passwordResetTemplate = ({
    resetUrl,
    appName = "YourApp"
}) => {

    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Reset Your Password</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f8f5;
    font-family: Arial, Helvetica, sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color: #f4f8f5;
        padding: 40px 15px;
    "
>

<tr>
<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width: 560px;
        background-color: #ffffff;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 4px 18px rgba(0,0,0,0.06);
    "
>

<!-- Header -->

<tr>
<td
    style="
        background-color: #16a34a;
        padding: 28px 35px;
        text-align: center;
    "
>

<h1
    style="
        margin: 0;
        color: #ffffff;
        font-size: 26px;
        font-weight: 700;
    "
>
    ${appName}
</h1>

</td>
</tr>


<!-- Content -->

<tr>
<td style="padding: 40px 35px;">

<h2
    style="
        margin: 0 0 15px;
        color: #17201a;
        font-size: 24px;
    "
>
    Reset your password
</h2>


<p
    style="
        margin: 0 0 18px;
        color: #5f6b63;
        font-size: 15px;
        line-height: 1.7;
    "
>
    We received a request to reset the password
    for your account.
</p>


<p
    style="
        margin: 0 0 28px;
        color: #5f6b63;
        font-size: 15px;
        line-height: 1.7;
    "
>
    Click the button below to create a new password.
    This link will expire in 
    <strong style="color: #17201a;">
            2 minutes
    </strong>.
</p>


<!-- Button -->

<table
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="margin: 0 auto 30px;"
>

<tr>

<td
    align="center"
    style="
        background-color: #16a34a;
        border-radius: 8px;
    "
>

<a
    href="${resetUrl}"
    style="
        display: inline-block;
        padding: 14px 30px;
        color: #ffffff;
        text-decoration: none;
        font-size: 15px;
        font-weight: 700;
    "
>
    Reset Password
</a>

</td>

</tr>

</table>


<!-- Security Notice -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color: #f0fdf4;
        border-left: 4px solid #16a34a;
        border-radius: 6px;
    "
>

<tr>

<td
    style="
        padding: 15px 16px;
        color: #36513e;
        font-size: 13px;
        line-height: 1.6;
    "
>

<strong>Didn't request this?</strong>
<br>

You can safely ignore this email.
Your password will remain unchanged.

</td>

</tr>

</table>


<p
    style="
        margin: 28px 0 0;
        color: #8a948d;
        font-size: 12px;
        line-height: 1.6;
    "
>
    For your security, never share this password
    reset link with anyone.
</p>

</td>
</tr>


<!-- Footer -->

<tr>

<td
    style="
        padding: 22px 35px;
        background-color: #fafafa;
        border-top: 1px solid #edf1ee;
        text-align: center;
    "
>

<p
    style="
        margin: 0;
        color: #8a948d;
        font-size: 12px;
    "
>
    © ${new Date().getFullYear()}
    ${appName}.
    All rights reserved.
</p>

</td>

</tr>

</table>

</td>
</tr>

</table>

</body>
</html>
`;
};


export const verifyEmailTemplate = ({
    verifyUrl,
    appName = "LandStore",
    userName = "there"
}) => {

    return `
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Verify your email</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f4f8f5;
    font-family: Arial, Helvetica, sans-serif;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color: #f4f8f5;
        padding: 40px 15px;
    "
>

<tr>
<td align="center">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width: 560px;
        background-color: #ffffff;
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 4px 18px rgba(0,0,0,0.06);
    "
>

<!-- Header -->

<tr>
<td
    style="
        background-color: #16a34a;
        padding: 28px 35px;
        text-align: center;
    "
>

<h1
    style="
        margin: 0;
        color: #ffffff;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: 0.3px;
    "
>
    ${appName}
</h1>

</td>
</tr>


<!-- Content -->

<tr>
<td style="padding: 40px 35px;">

<h2
    style="
        margin: 0 0 15px;
        color: #17201a;
        font-size: 24px;
        font-weight: 700;
    "
>
    Welcome, ${userName}!
</h2>


<p
    style="
        margin: 0 0 18px;
        color: #5f6b63;
        font-size: 15px;
        line-height: 1.7;
    "
>
    Thanks for creating an account with
    <strong style="color: #17201a;">
        ${appName}
    </strong>.
</p>


<p
    style="
        margin: 0 0 28px;
        color: #5f6b63;
        font-size: 15px;
        line-height: 1.7;
    "
>
    Please verify your email address to activate
    your account and get started.
</p>


<!-- Verify Button -->

<table
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        margin: 0 auto 30px;
    "
>

<tr>

<td
    align="center"
    style="
        background-color: #16a34a;
        border-radius: 8px;
    "
>

<a
    href="${verifyUrl}"
    style="
        display: inline-block;
        padding: 14px 32px;
        color: #ffffff;
        text-decoration: none;
        font-size: 15px;
        font-weight: 700;
    "
>
    Verify Email
</a>

</td>

</tr>

</table>


<!-- Expiration Notice -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color: #f0fdf4;
        border-left: 4px solid #16a34a;
        border-radius: 6px;
    "
>

<tr>

<td
    style="
        padding: 15px 16px;
        color: #36513e;
        font-size: 13px;
        line-height: 1.6;
    "
>

<strong style="color: #17201a;">
    Verification link expires soon
</strong>

<br>

For your security, this verification link will
expire in <strong>1 hour</strong>.

</td>

</tr>

</table>


<!-- Alternative Link -->

<p
    style="
        margin: 28px 0 8px;
        color: #8a948d;
        font-size: 12px;
        line-height: 1.6;
    "
>
    If the button doesn't work, copy and paste
    the following link into your browser:
</p>


<p
    style="
        margin: 0;
        word-break: break-all;
        color: #16a34a;
        font-size: 12px;
        line-height: 1.6;
    "
>
    ${verifyUrl}
</p>


<!-- Security -->

<p
    style="
        margin: 28px 0 0;
        color: #8a948d;
        font-size: 12px;
        line-height: 1.6;
    "
>
    If you didn't create an account with
    ${appName}, you can safely ignore this email.
</p>

</td>
</tr>


<!-- Footer -->

<tr>

<td
    style="
        padding: 22px 35px;
        background-color: #fafafa;
        border-top: 1px solid #edf1ee;
        text-align: center;
    "
>

<p
    style="
        margin: 0;
        color: #8a948d;
        font-size: 12px;
        line-height: 1.6;
    "
>
    © ${new Date().getFullYear()}
    ${appName}.
    All rights reserved.
</p>

</td>

</tr>

</table>

</td>
</tr>

</table>

</body>
</html>
`;
};



export const listingStatusTemplate = ({
    userName,
    listingCode,
    listingTitle,
    status,
    reason,
    appName
}) => {

    const statusConfig = {

        active: {
            label: "Active",
            title: "Your listing is now live!",
            message:
                "Great news! Your land listing has been approved and is now visible to potential buyers."
        },

        inactive: {
            label: "Inactive",
            title: "Your listing has been deactivated",
            message:
                "Your listing is currently inactive and is no longer visible on the marketplace."
        },

        pending: {
            label: "Pending",
            title: "Your listing is under review",
            message:
                "Your listing has been submitted successfully and is waiting for review."
        },

        under_review: {
            label: "Under Review",
            title: "Your listing is being reviewed",
            message:
                "Our team is currently reviewing your listing. We will update you once the review is complete."
        },

        draft: {
            label: "Draft",
            title: "Your listing is still a draft",
            message:
                "Your listing has been saved as a draft. Complete the required information before submitting it for review."
        }

    };

    const config = statusConfig[status] || {
        label: status,
        title: "Your listing status has changed",
        message:
            "The status of your listing has been updated. Log in to your account to view the latest details."
    };


    const dashboardUrl =
        `${_config.FRONTEND_URL}/dashboard/listings`;


    return `
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>${config.title}</title>

</head>


<body style="
    margin: 0;
    padding: 0;
    background-color: #F4F8F5;
    font-family: Arial, Helvetica, sans-serif;
    color: #17221B;
">


<!-- Main -->

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color: #F4F8F5;"
>

<tr>

<td
    align="center"
    style="padding: 45px 15px;"
>


<!-- Email Card -->

<table
    width="600"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        max-width: 600px;
        width: 100%;
        background-color: #FFFFFF;
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid #E2EDE5;
    "
>


<!-- Green Header -->

<tr>

<td
    style="
        background-color: #16834B;
        padding: 28px 35px;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
>

<tr>

<td>

    <div style="
        font-size: 25px;
        line-height: 1;
        font-weight: 700;
        color: #FFFFFF;
        letter-spacing: -0.5px;
    ">
        ${appName}
    </div>

</td>


<td align="right">

    <div style="
        font-size: 12px;
        color: #DDF4E7;
        font-weight: 600;
    ">
        LISTING UPDATE
    </div>

</td>

</tr>

</table>

</td>

</tr>


<!-- Green Accent -->

<tr>

<td style="
    height: 5px;
    background-color: #0F663A;
    font-size: 0;
    line-height: 0;
">
    &nbsp;
</td>

</tr>


<!-- Greeting / Hero -->

<tr>

<td
    style="
        padding: 42px 35px 25px;
    "
>

<div style="
    font-size: 14px;
    color: #6B7B70;
    margin-bottom: 10px;
">
    Hello ${userName},
</div>


<h1 style="
    margin: 0 0 15px;
    font-size: 28px;
    line-height: 1.3;
    color: #17221B;
">

    ${config.title}

</h1>


<p style="
    margin: 0;
    font-size: 15px;
    line-height: 1.7;
    color: #647067;
">

    ${config.message}

</p>

</td>

</tr>


<!-- Status -->

<tr>

<td
    style="
        padding: 0 35px 30px;
    "
>

<span style="
    display: inline-block;
    padding: 8px 15px;
    border-radius: 50px;
    background-color: #E8F7EE;
    color: #16834B;
    font-size: 13px;
    font-weight: 700;
">

    ● ${config.label}

</span>

</td>

</tr>


<!-- Listing Information -->

<tr>

<td style="
    padding: 0 35px 30px;
">

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color: #FAFCFB;
        border: 1px solid #DDEBE1;
        border-radius: 12px;
    "
>

<tr>

<td style="padding: 24px;">

    <div style="
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #829087;
        font-weight: 700;
        margin-bottom: 8px;
    ">
        Your Listing
    </div>


    <div style="
        font-size: 19px;
        line-height: 1.4;
        font-weight: 700;
        color: #17221B;
        margin-bottom: 22px;
    ">
        ${listingTitle}
    </div>


    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
    >

    <tr>

        <td>

            <div style="
                font-size: 11px;
                color: #829087;
                text-transform: uppercase;
                letter-spacing: 0.6px;
                margin-bottom: 5px;
            ">
                Listing Code
            </div>

            <div style="
                font-size: 14px;
                color: #26352C;
                font-weight: 600;
            ">
                ${listingCode}
            </div>

        </td>


        <td align="right">

            <div style="
                font-size: 11px;
                color: #829087;
                text-transform: uppercase;
                letter-spacing: 0.6px;
                margin-bottom: 5px;
            ">
                Status
            </div>

            <div style="
                font-size: 14px;
                color: #16834B;
                font-weight: 700;
            ">
                ${config.label}
            </div>

        </td>

    </tr>

    </table>

</td>

</tr>

</table>

</td>

</tr>


<!-- Reason -->

${
    reason
        ? `

<tr>

<td style="
    padding: 0 35px 30px;
">

<div style="
    background-color: #F1FAF4;
    border: 1px solid #D6EBDD;
    border-left: 4px solid #16834B;
    border-radius: 8px;
    padding: 17px 18px;
">

    <div style="
        font-size: 12px;
        font-weight: 700;
        color: #16834B;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 7px;
    ">
        Review Note
    </div>

    <div style="
        font-size: 14px;
        line-height: 1.6;
        color: #415148;
    ">
        ${reason}
    </div>

</div>

</td>

</tr>

`
        : ""
}


<!-- CTA -->

<tr>

<td
    align="center"
    style="
        padding: 5px 35px 42px;
    "
>

<a
    href="${dashboardUrl}"
    style="
        display: inline-block;
        padding: 14px 30px;
        background-color: #16834B;
        color: #FFFFFF;
        text-decoration: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 700;
    "
>
    View My Listing
</a>

</td>

</tr>


<!-- Divider -->

<tr>

<td style="padding: 0 35px;">

<div style="
    height: 1px;
    background-color: #E3EAE5;
">
</div>

</td>

</tr>


<!-- Footer -->

<tr>

<td
    align="center"
    style="
        padding: 26px 35px 32px;
    "
>

<div style="
    font-size: 13px;
    line-height: 1.6;
    color: #849087;
">

    This is an automated notification from ${appName}.

</div>


<div style="
    margin-top: 8px;
    font-size: 12px;
    color: #AAB4AD;
">

    © ${new Date().getFullYear()} ${appName}. All rights reserved.

</div>

</td>

</tr>


</table>

<!-- End Card -->


</td>

</tr>

</table>

<!-- End Main -->


</body>

</html>
    `;
};
