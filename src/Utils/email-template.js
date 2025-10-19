export const generateOtpEmail = (otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>OTP Verification</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f2f4f7;
    margin: 0;
    padding: 30px;
  }
  .card {
    max-width: 480px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    text-align: center;
    padding: 30px 20px;
  }
  .header-img {
    width: 80px;
    margin-bottom: 15px;
  }
  .otp {
    display: inline-block;
    background-color: #0d6efd;
    color: white;
    font-size: 28px;
    font-weight: bold;
    padding: 10px 20px;
    border-radius: 8px;
    letter-spacing: 4px;
  }
  p {
    color: #555;
    line-height: 1.6;
  }
</style>
</head>
<body>
  <div class="card">
    <img src="https://cdn-icons-png.flaticon.com/512/747/747376.png" alt="Cure Logo" class="header-img" />
    <h2>OTP Verification</h2>
    <p>Your verification code is:</p>
    <p class="otp">${otp}</p>
    <p>This code is valid for <strong>10 minutes</strong>. Please do not share it with anyone.</p>
  </div>
</body>
</html>
`;
export const bookingEmail = (user, date, time) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Booking Confirmation</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f2f4f7;
    margin: 0;
    padding: 30px;
  }
  .card {
    max-width: 480px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    text-align: center;
    padding: 30px 20px;
  }
  .header-img {
    width: 100px;
    margin-bottom: 15px;
  }
  .btn {
    display: inline-block;
    background-color: #28a745;
    color: #fff;
    padding: 10px 18px;
    border-radius: 8px;
    text-decoration: none;
    margin-top: 10px;
    font-weight: bold;
  }
  p {
    color: #555;
    line-height: 1.6;
  }
</style>
</head>
<body>
  <div class="card">
    <img src="https://cdn-icons-png.flaticon.com/512/3771/3771518.png" alt="Booking Icon" class="header-img" />
    <h2>Booking Confirmed!</h2>
    <p> Reservation of <strong>${user}</strong> has been successfully scheduled.</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
  </div>
</body>
</html>
`;
export const cancelBookingEmail = (user, date, time) => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Booking Cancellation</title>
<style>
  body {
    font-family: Arial, sans-serif;
    background-color: #f2f4f7;
    margin: 0;
    padding: 30px;
  }
  .card {
    max-width: 480px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    text-align: center;
    padding: 30px 20px;
  }
  .header-img {
    width: 100px;
    margin-bottom: 15px;
  }
  .btn {
    display: inline-block;
    background-color: #dc3545;
    color: #fff;
    padding: 10px 18px;
    border-radius: 8px;
    text-decoration: none;
    margin-top: 10px;
    font-weight: bold;
  }
  p {
    color: #555;
    line-height: 1.6;
  }
</style>
</head>
<body>
  <div class="card">
    <img src="https://cdn-icons-png.flaticon.com/512/463/463612.png" alt="Cancel Icon" class="header-img" />
    <h2>Booking Cancelled</h2>
    <p>Reservation of <strong>${user}</strong> has been cancelled.</p>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>Time:</strong> ${time}</p>
  </div>
</body>
</html>
`;
