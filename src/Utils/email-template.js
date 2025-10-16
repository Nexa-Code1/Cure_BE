export const generateOtpEmail = (otp) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            border: 1px solid #ccc;
        }
        .container {
            max-width: 600px;
            background: #ffffff;
        }
        .otp {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <img src="https://t4.ftcdn.net/jpg/05/23/69/29/360_F_523692923_hxuZgDZr6uzJx6yVvNjOGfgVnQVXrKad.jpg" alt="Logo" width="345" height="150">
        <h2>OTP Verification</h2>
        <p>Your verification code is:</p>
        <p class="otp">${otp}</p>
        <p>Please enter this code. This code is valid for 10 minutes.</p>
    </div>
</body>
</html>`;

