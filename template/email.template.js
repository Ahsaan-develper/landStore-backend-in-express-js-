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