export const base = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <style>
    body          { margin:0; padding:0; background:#f4f4f4; font-family:Arial,sans-serif; }
    .wrapper      { max-width:600px; margin:40px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08); }
    .header       { background:#1a3c5e; padding:30px 40px; text-align:center; }
    .header h1    { color:#fff; margin:0; font-size:22px; letter-spacing:1px; }
    .body         { padding:36px 40px; color:#333; }
    .body h2      { margin-top:0; font-size:18px; color:#1a3c5e; }
    .body p       { font-size:14px; line-height:1.7; color:#555; }
    .badge        { display:inline-block; padding:6px 16px; border-radius:20px; font-size:13px; font-weight:bold; margin:12px 0; }
    .pending      { background:#fff3cd; color:#856404; }
    .active       { background:#d4edda; color:#155724; }
    .inactive     { background:#f8d7da; color:#721c24; }
    .under_review { background:#cce5ff; color:#004085; }
    .cancelled    { background:#f8d7da; color:#721c24; }
    .btn          { display:inline-block; margin-top:20px; padding:12px 28px; background:#1a3c5e; color:#fff !important; text-decoration:none; border-radius:6px; font-size:14px; }
    .divider      { border:none; border-top:1px solid #eee; margin:24px 0; }
    .footer       { background:#f9f9f9; padding:20px 40px; text-align:center; font-size:12px; color:#aaa; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>LandStore</h1></div>
    <div class="body">${content}</div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} LandStore. All rights reserved.<br/>
      No direct seller contact. Bypass attempts result in immediate account suspension.
    </div>
  </div>
</body>
</html>`;