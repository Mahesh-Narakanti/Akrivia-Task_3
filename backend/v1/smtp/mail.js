const express = require('express');
const nodemailer = require('nodemailer');
const smtpTransport = require("nodemailer-smtp-transport");
const router = express.Router();
const jwt = require('jsonwebtoken');
const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);
const bcrypt = require('bcryptjs');
require('dotenv').config();

const transporter = nodemailer.createTransport(smtpTransport({
  service: process.env.SMTP_SERVICE, // SMTP service like Gmail
  auth: {
    user: process.env.SMTP_USER, // Use the environment variable for the user
    pass: process.env.SMTP_PASS, // Use the environment variable for the password
  },
}));


router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
   // console.log(email);
    // Check if the email exists in your user database
    const user = await knex('users').select('id').where("email", email).first();
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
   // console.log(user);
    // Generate a reset token (JWT)
    const resetToken = jwt.sign(
        { userId: user.id }, // Payload (includes user ID)
        process.env.JWT_SECRET, // Secret key for signing the token
        { expiresIn: "1h" } // Token expires in 1 hour
    );
   // console.log(resetToken);
    // Send the reset email with the token
    const resetUrl = `http://localhost:4200/auth/reset-password?token=${resetToken}`;
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: "Password Reset Request",
        text: `Click the link below to reset your password:\n\n${resetUrl}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ message: "Error sending email", error: error.toString() });
      }

      res.status(200).json({ message: "Password reset email sent" });
    });
});

// 2. Reset Password Endpoint
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.userId;
    if (!userId) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
      
    console.log(userId);

    const password=await bcrypt.hash(newPassword, 10);
    const user= await knex('users').update('password', password).where('id', userId);
      if (user===0)
          return res.status(404).json({ message: "user not found" });
    // Send success response
    res.status(200).json({ message: "Password has been reset successfully" });

});


module.exports = router;