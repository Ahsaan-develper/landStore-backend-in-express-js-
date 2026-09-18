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
    status,
    appName
}) => {

    const statusConfig = {
        active: {
            label: "Active",
            title: "Your listing is now active!",
            message:
                "Great news! Your land listing has been approved and is now visible to potential buyers."
        },

        inactive: {
            label: "Inactive",
            title: "Your listing is now inactive",
            message:
                "Your land listing has been deactivated and is currently not visible on the marketplace."
        },

        pending: {
            label: "Pending",
            title: "Your listing is pending",
            message:
                "Your land listing has been submitted successfully and is waiting for review."
        },

        under_review: {
            label: "Under Review",
            title: "Your listing is under review",
            message:
                "Our team is currently reviewing your land listing. We will update you once the review is complete."
        },

        draft: {
            label: "Draft",
            title: "Your listing is saved as a draft",
            message:
                "Your land listing is currently saved as a draft. You can continue editing it from your dashboard."
        }
    };

    const config = statusConfig[status] || {
        label: status,
        title: "Your listing status has changed",
        message:
            "The status of your land listing has been updated. Please log in to your account to view the latest details."
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


<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color: #F4F8F5;
    "
>

<tr>

<td
    align="center"
    style="
        padding: 45px 15px;
    "
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
        border: 1px solid #E1EBE4;
    "
>


<!-- Header -->

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
    border="0"
>

<tr>

<td>

<div style="
    font-size: 25px;
    font-weight: 700;
    color: #FFFFFF;
">
    ${appName}
</div>

</td>


<td align="right">

<div style="
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    color: #DDF4E7;
">
    LISTING UPDATE
</div>

</td>

</tr>

</table>

</td>

</tr>


<!-- Dark Green Accent -->

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


<!-- Main Content -->

<tr>

<td
    style="
        padding: 42px 35px 20px;
    "
>

<div style="
    font-size: 14px;
    color: #718078;
    margin-bottom: 10px;
">
    Hello ${userName},
</div>


<h1 style="
    margin: 0 0 16px;
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
    color: #637067;
">

    ${config.message}

</p>

</td>

</tr>


<!-- Status Badge -->

<tr>

<td
    style="
        padding: 5px 35px 30px;
    "
>

<span style="
    display: inline-block;
    padding: 9px 16px;
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


<!-- Listing Card -->

<tr>

<td
    style="
        padding: 0 35px 35px;
    "
>

<table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
        background-color: #FAFCFB;
        border: 1px solid #DCE9E0;
        border-radius: 12px;
    "
>

<tr>

<td
    style="
        padding: 24px;
    "
>

<div style="
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 700;
    color: #849188;
    margin-bottom: 8px;
">
    Listing Code
</div>


<div style="
    font-size: 20px;
    font-weight: 700;
    color: #17221B;
">
    ${listingCode}
</div>


<div style="
    margin-top: 18px;
    height: 1px;
    background-color: #E1EAE4;
">
</div>


<div style="
    margin-top: 18px;
">

<span style="
    font-size: 12px;
    color: #849188;
">
    Current Status
</span>

<br>

<span style="
    display: inline-block;
    margin-top: 5px;
    font-size: 14px;
    font-weight: 700;
    color: #16834B;
">
    ${config.label}
</span>

</div>

</td>

</tr>

</table>

</td>

</tr>


<!-- Button -->

<tr>

<td
    align="center"
    style="
        padding: 0 35px 42px;
    "
>

<a
    href="${dashboardUrl}"
    style="
        display: inline-block;
        padding: 14px 32px;
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

<td style="
    padding: 0 35px;
">

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

</td>

</tr>

</table>


</body>

</html>
    `;
};