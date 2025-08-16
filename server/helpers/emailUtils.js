const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Function to send Register OTP via email
const sendOtpToEmail = async (email, otp) => {
  try {
    // Set up the transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.NOREPLY_EMAIL_USER,
        pass: process.env.NOREPLY_EMAIL_PASS,
      },
    });

    // HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #444; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
        <h2 style="text-align: center; color: #333;">Welcome to BDMedics!</h2>
        <p style="font-size: 16px; text-align: center;">Thank you for registering with us. Please use the following OTP to complete your registration:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #007bff;">${otp}</span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #666;">
          This OTP is valid for 10 minutes. If you did not request this, please ignore this email.
        </p>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
          &copy; ${new Date().getFullYear()} BDMedics. All rights reserved.
        </p>
      </div>
    `;

    // Mail options
    const mailOptions = {
      from: `BDMedics - <${process.env.NOREPLY_EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Registration as a doctor at BDMedics",
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};
// Function to send Patient Register OTP via email
const sendPatientRegOtpToEmail = async (email, otp) => {
  try {
    // Set up the transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.NOREPLY_EMAIL_USER,
        pass: process.env.NOREPLY_EMAIL_PASS,
      },
    });

    // HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #444; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
        <h2 style="text-align: center; color: #333;">Welcome to BDMedics!</h2>
        <p style="font-size: 16px; text-align: center;">Thank you for registering with us. Please use the following OTP to complete your registration:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #007bff;">${otp}</span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #666;">
          This OTP is valid for 10 minutes. If you did not request this, please ignore this email.
        </p>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
          &copy; ${new Date().getFullYear()} BDMedics. All rights reserved.
        </p>
      </div>
    `;

    // Mail options
    const mailOptions = {
      from: `BDMedics - <${process.env.NOREPLY_EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for Registration as a patient at BDMedics",
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};

// Function to send Change Email OTP via email
const sendChangeEmailOtp = async (email, otp) => {
  try {
    // Set up the transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.NOREPLY_EMAIL_USER,
        pass: process.env.NOREPLY_EMAIL_PASS,
      },
    });

    // HTML content for the email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #444; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px;">
        <h2 style="text-align: center; color: #333;">Hi! from BDMedics!</h2>
        <p style="font-size: 16px; text-align: center;">You wanted to change your email. Please use the following OTP to change your email:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="font-size: 28px; font-weight: bold; color: #007bff;">${otp}</span>
        </div>
        <p style="font-size: 14px; text-align: center; color: #666;">
          This OTP is valid for 10 minutes.
        </p>
        <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
          &copy; ${new Date().getFullYear()} BDMedics. All rights reserved.
        </p>
      </div>
    `;

    // Mail options
    const mailOptions = {
      from: `BDMedics - <${process.env.NOREPLY_EMAIL_USER}>`,
      to: email,
      subject: "Your OTP for chnaging email at BDMedics",
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully to:", email);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP");
  }
};

module.exports = { sendOtpToEmail, sendChangeEmailOtp, sendPatientRegOtpToEmail };
