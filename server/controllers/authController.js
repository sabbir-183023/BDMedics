const {
  sendOtpToEmail,
  sendPatientRegOtpToEmail,
  sendChangeEmailOtp,
} = require("../helpers/emailUtils.js");

const userModel = require("../models/userModel.js");
const patientModel = require("../models/patientModel.js");
const SubscriptionExpiration = require("../models/subscriptionExpirationModel.js");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const { Error } = require("mongoose");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const slugify = require("slugify");
const DoctorAvailability = require("../models/doctorAvailability");
const { default: mongoose } = require("mongoose");

//check username
const checkUsername = async (req, res) => {
  const { username } = req.query;
  const exists = await userModel.exists({ username });
  res.json({
    success: !exists,
    message: !exists ? "Username is available" : "Username is already taken",
  });
};

//Check email
const checkEmail = async (req, res) => {
  const { email } = req.query;
  const exists = await userModel.exists({ email });
  res.json({
    success: !exists,
    message: !exists ? "Email is available" : "Email is already exist",
  });
};

// send Register OTP
const sendOtpController = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User already exists, Please login",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP

    // Send OTP to the user's email
    await sendOtpToEmail(email, otp);

    // Store OTP temporarily in memory (this can be replaced with Redis or a database)
    global.otpCache = global.otpCache || {};
    global.otpCache[email] = otp;

    res.send({ success: true, message: "OTP sent to your email!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ success: false, message: "Failed to send OTP." });
  }
};

// Endpoint to verify OTP
const verifyOtpController = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (global.otpCache[email] === parseInt(otp)) {
      return res.send({ success: true, message: "OTP verified successfully!" });
    } else {
      return res.send({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({ success: false, message: "Error verifying OTP." });
  }
};

//user registration
const registerUser = async (req, res) => {
  try {
    const { name, phone, password, email, username, otp } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "phone is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "password is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "email is required",
      });
    }
    if (!username) {
      return res.status(400).send({
        success: false,
        message: "username is required",
      });
    }
    if (!otp) {
      return res.status(400).send({
        success: false,
        message: "otp is required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // Check if OTP is verified
    if (!global.otpCache || global.otpCache[email] !== parseInt(otp)) {
      return res.status(400).send({
        success: false,
        message: "Invalid or unverified OTP.",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const user = new userModel({
      name,
      username,
      email,
      phone,
      address: "",
      password: hashedPassword,
      role: 2,
      title: "",
      description: "",
      degree: "",
      image: "",
      speciality: "",
      signature: "",
    });

    await user.save();

    // Clear OTP cache for the user after successful registration
    delete global.otpCache[email];

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

//login controller
const loginController = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  try {
    const multipleUser = await userModel.find({ phone: identifier });

    if (multipleUser.length > 1) {
      return res.status(400).json({
        success: false,
        message: "Multiple User Found With This Phone, Use Email Instead!",
      });
    }

    // Find user by email or phone
    const user = await userModel.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    // Compare password using helper
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        _id: user._id,
        role: user.role, // add more fields if needed
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // optional: adjust expiration as needed
    );

    // Remove password before sending user data
    const { password: _, ...userData } = user.toObject();

    res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

//upload profile pic
const uploadProfilePicController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filename = req.file.filename;
    const filePath = `/uploads/profilepics/${filename}`;
    const userId = req.user._id;

    // First get the user
    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Now you can validate the user fields
    const requiredFields = [
      "degree",
      "speciality",
      "description",
      "title",
      "address",
    ];

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    // Rest of your code...
    // If user already has an image, delete the old file
    if (user.image) {
      const oldImagePath = path.join(__dirname, "..", user.image); // adjust path if needed

      // Check if file exists before deleting
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // delete the old image file
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { image: filePath },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Profile picture uploaded and updated",
      imageUrl: filePath,
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in uploading profile pics",
      error,
    });
  }
};

//name update
const nameUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name } = req.body;

    if (name?.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Name can not be blank",
      });
    }

    // Validate required fields
    const requiredFields = [
      "degree",
      "speciality",
      "description",
      "image",
      "title",
      "address",
    ];

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { name: name },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Name updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in updating name",
      error,
    });
  }
};
//phone update
const phoneUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { phone } = req.body;

    if (phone?.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Phone Can not be blank!",
      });
    }

    // Validate required fields
    const requiredFields = [
      "degree",
      "speciality",
      "description",
      "image",
      "title",
    ];

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { phone: phone },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "Phone updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in updating phone",
      error,
    });
  }
};
//email update

// send Register OTP
const sendEmailChangeOtpController = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "This Email already exists!",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP

    // Send OTP to the user's email
    await sendChangeEmailOtp(email, otp);

    // Store OTP temporarily in memory (this can be replaced with Redis or a database)
    global.otpCache = global.otpCache || {};
    global.otpCache[email] = otp;

    res.send({ success: true, message: "OTP sent to your email!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ success: false, message: "Failed to send OTP." });
  }
};

//final email update function
const emailUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { email, otp } = req.body;

    if (global.otpCache[email] === parseInt(otp)) {
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { email: email },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "Email updated",
        user: updatedUser,
      });
    } else {
      return res.status(402).json({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in updating email",
      error,
    });
  }
};
//address update
const addressUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { address } = req.body;

    // Validate required fields
    const requiredFields = [
      "degree",
      "speciality",
      "description",
      "image",
      "title",
    ];

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    // Update allInfoUpdated false if address is blank
    if (address.length === 0) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: false },
        { new: true }
      );
    }

    // Update address
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { address: address },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      user: updatedUser,
      profileComplete: allFieldsValid,
    });
  } catch (error) {
    console.error("Error in addressUpdateController:", error);
    res.status(500).json({
      success: false,
      message: "Error updating address",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//degree update controller
const degreeUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { degree } = req.body;

    // Validate required fields
    const requiredFields = [
      "speciality",
      "description",
      "image",
      "title",
      "address",
    ];

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    // Update allInfoUpdated false if degree is blank
    if (degree.length === 0) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: false },
        { new: true }
      );
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { degree: degree },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "degree updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in updating degree",
      error,
    });
  }
};
//username update
const usernameUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username } = req.body;

    if (username?.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Username can not be blank",
      });
    }

    // Validate required fields
    const requiredFields = [
      "degree",
      "speciality",
      "description",
      "image",
      "title",
      "address",
    ];

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    // Check if the username already exists
    const existingUser = await userModel.findOne({ username });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "This username already exists!",
      });
    } else {
      const updatedUser = await userModel.findByIdAndUpdate(
        userId,
        { username: username },
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "Username updated",
        user: updatedUser,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in updating degree",
      error,
    });
  }
};

//speciality update
const specialityUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { speciality } = req.body;

    // Validate required fields
    const requiredFields = [
      "degree",
      "address",
      "description",
      "image",
      "title",
    ];

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    // Update allInfoUpdated false if speciality is blank
    if (speciality.length === 0) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: false },
        { new: true }
      );
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { speciality: speciality },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "speciality updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in updating speciality",
      error,
    });
  }
};
//title update
const titleUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title } = req.body;

    // Validate required fields
    const requiredFields = [
      "degree",
      "speciality",
      "description",
      "image",
      "address",
    ];

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    // Update allInfoUpdated false if title is blank
    if (title.length === 0) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: false },
        { new: true }
      );
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { title: title },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "title updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in updating title",
      error,
    });
  }
};

//description update
const descriptionUpdateController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { description } = req.body;

    // Validate required fields
    const requiredFields = [
      "degree",
      "speciality",
      "address",
      "image",
      "title",
    ];

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check all required fields using while loop
    let i = 0;
    let allFieldsValid = true;

    while (i < requiredFields.length && allFieldsValid) {
      if (!user[requiredFields[i]]?.length) {
        allFieldsValid = false;
      }
      i++;
    }

    // Update profile completion status if all fields are valid
    if (allFieldsValid) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: true },
        { new: true }
      );
    }

    // Update allInfoUpdated false if description is blank
    if (description.length === 0) {
      await userModel.findByIdAndUpdate(
        userId,
        { allInfoUpdated: false },
        { new: true }
      );
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { description: description },
      { new: true }
    );
    res.status(200).json({
      success: true,
      message: "description updated",
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in updating description",
      error,
    });
  }
};

//upload signature pic
const uploadSignaturePicController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const filename = req.file.filename;
    const filePath = `/uploads/signaturepics/${filename}`;
    const userId = req.user._id;

    const user = await userModel.findById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // If user already has an signature, delete the old file
    if (user.signature) {
      const oldSignaturePath = path.join(__dirname, "..", user.signature); // adjust path if needed

      // Check if file exists before deleting
      if (fs.existsSync(oldSignaturePath)) {
        fs.unlinkSync(oldSignaturePath); // delete the old signature file
      }
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { signature: filePath },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Signature uploaded and updated",
      imageUrl: filePath,
      user: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: "error in uploading signature",
      error,
    });
  }
};

//upload slide photos
const uploadSlidePicsController = async (req, res) => {
  try {
    // Check if any files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const userId = req.user._id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingSlides = user.slides || [];
    const newSlides = req.files.map(
      (file) => `/uploads/slidepics/${file.filename}`
    );

    // Check if total exceeds limit
    if (existingSlides.length + newSlides.length > 5) {
      // Delete the newly uploaded files since they won’t be used
      for (const file of req.files) {
        const filePath = path.join(
          __dirname,
          "..",
          `/uploads/slidepics/${file.filename}`
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      return res.status(400).json({
        success: false,
        message: `Maximum 5 slide images allowed. You currently have ${existingSlides.length}.`,
      });
    }

    // Append new slide paths
    user.slides = [...existingSlides, ...newSlides];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Slide pictures uploaded",
      imageUrls: user.slides,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error uploading slide pictures",
      error,
    });
  }
};

//deleting single pic from slide
const deleteSlidePicController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { imagePath } = req.body;

    if (!imagePath) {
      return res.status(400).json({
        success: false,
        message: "Image path is required",
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Remove the image from the slides array
    const updatedSlides = user.slides.filter((path) => path !== imagePath);
    const fileToDelete = path.join(__dirname, "..", imagePath);

    // Delete from filesystem
    if (fs.existsSync(fileToDelete)) {
      fs.unlinkSync(fileToDelete);
    }

    // Update user slides
    user.slides = updatedSlides;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Slide image deleted",
      user,
    });
  } catch (error) {
    console.error("Delete slide pic error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete slide picture",
      error,
    });
  }
};

//Patient Id creation

const patientIdCreate = async (req, res) => {
  try {
    const { name, phone, dob } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "Phone is required",
      });
    }
    if (!dob) {
      return res.status(400).send({
        success: false,
        message: "Date of Birth is required",
      });
    }

    // Function to generate random patient ID
    const generatePatientId = () => {
      // Generate two random uppercase letters (A-Z)
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const letterPart =
        letters.charAt(Math.floor(Math.random() * letters.length)) +
        letters.charAt(Math.floor(Math.random() * letters.length));

      // Generate four random digits (0-9)
      const numberPart = Math.floor(1000 + Math.random() * 9000).toString();

      return letterPart + numberPart;
    };

    // Generate unique patient ID
    let patientId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops

    while (!isUnique && attempts < maxAttempts) {
      patientId = generatePatientId();
      const existingPatient = await userModel.findOne({ patientId });

      if (!existingPatient) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).send({
        success: false,
        message:
          "Could not generate a unique patient ID after multiple attempts",
      });
    }

    // Create new user
    const patient = new patientModel({
      name,
      phone,
      dob,
      patientId,
    });

    await patient.save();

    res.status(201).send({
      success: true,
      message: "Patient ID Created successfully",
      patient,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in creating patient ID",
      error: error.message, // Send only the error message for security
    });
  }
};

//looking for existing patient ids
const searchPatientByPhone = async (req, res) => {
  try {
    const { searchPhone } = req.body;
    // Validation
    if (!searchPhone) {
      return res.status(400).send({
        success: false,
        message: "Phone is required",
      });
    }
    const searchResult = await patientModel.find({ phone: searchPhone });
    res.status(201).send({
      success: true,
      message: "Patients successfully",
      searchResult,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in searching patient ID",
      error: error.message,
    });
  }
};

//Send otp for patient registration
const sendPatientOTPCOntroller = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "This email is already used. Try different email",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000); // Generate a random OTP

    // Send OTP to the user's email
    await sendPatientRegOtpToEmail(email, otp);

    // Store OTP temporarily in memory (this can be replaced with Redis or a database)
    global.otpCache = global.otpCache || {};
    global.otpCache[email] = otp;

    res.send({ success: true, message: "OTP is sent to your email!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).send({ success: false, message: "Failed to send OTP." });
  }
};

//Patient user registration without patient id
const registerPatientUser = async (req, res) => {
  try {
    const { name, phone, password, email, dob, otp } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "phone is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "password is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "email is required",
      });
    }
    if (!dob) {
      return res.status(400).send({
        success: false,
        message: "username is required",
      });
    }
    if (!otp) {
      return res.status(400).send({
        success: false,
        message: "otp is required",
      });
    }

    const preUsername = slugify(name, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // Check if OTP is verified
    if (!global.otpCache || global.otpCache[email] !== parseInt(otp)) {
      return res.status(400).send({
        success: false,
        message: "Invalid or unverified OTP.",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Function to generate random patient ID
    const generatePatientId = () => {
      // Generate two random uppercase letters (A-Z)
      const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const letterPart =
        letters.charAt(Math.floor(Math.random() * letters.length)) +
        letters.charAt(Math.floor(Math.random() * letters.length));

      // Generate four random digits (0-9)
      const numberPart = Math.floor(1000 + Math.random() * 9000).toString();

      return letterPart + numberPart;
    };

    // Generate unique patient ID
    let patientId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10; // Prevent infinite loops

    while (!isUnique && attempts < maxAttempts) {
      patientId = generatePatientId();
      const existingPatient = await userModel.findOne({ patientId });

      if (!existingPatient) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).send({
        success: false,
        message:
          "Could not generate a unique patient ID after multiple attempts",
      });
    }
    //Create new patient
    const patient = new patientModel({
      name,
      phone,
      dob,
      patientId,
    });
    await patient.save();

    // Create new user
    const user = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 4,
      patient: patient._id,
      ref: patientId,
      username: preUsername + "-" + patientId,
    });

    await user.save();

    // Clear OTP cache for the user after successful registration
    delete global.otpCache[email];

    res.status(201).send({
      success: true,
      message: "User registered successfully",
      user,
      patient,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

// Check patient Id
const checkPatientId = async (req, res) => {
  try {
    const { patientId } = req.query;

    // First check if already registered as user
    const isRegisteredUser = await userModel.exists({ ref: patientId });
    if (isRegisteredUser) {
      return res.json({
        success: false,
        exists: true,
        message: "This patient ID is already registered as an user",
      });
    }

    // Then check if exists in patient records
    const existsInPatientRecords = await patientModel.exists({ patientId });
    return res.json({
      success: true,
      exists: existsInPatientRecords,
      message: existsInPatientRecords
        ? "Patient ID exists (not registered yet)"
        : "Patient ID does not exist",
    });
  } catch (error) {
    console.error("Error checking patient ID:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking patient ID",
    });
  }
};

// Endpoint to verify OTP
const verifyOtpControllerWithPId = async (req, res) => {
  try {
    const { email, otp, patientId } = req.body;
    const patient = await patientModel.findOne({ patientId });
    if (global.otpCache[email] === parseInt(otp)) {
      return res.send({
        success: true,
        message: "OTP verified successfully!",
        patient,
      });
    } else {
      return res.send({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).send({ success: false, message: "Error verifying OTP." });
  }
};

//Patient user registration having patient id
const registerPatientUser2 = async (req, res) => {
  try {
    const { name, phone, password, email, dob, otp, patientId } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "phone is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "password is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "email is required",
      });
    }
    if (!dob) {
      return res.status(400).send({
        success: false,
        message: "username is required",
      });
    }
    if (!otp) {
      return res.status(400).send({
        success: false,
        message: "otp is required",
      });
    }
    if (!patientId) {
      return res.status(400).send({
        success: false,
        message: "Patient Id is required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // Check if OTP is verified
    if (!global.otpCache || global.otpCache[email] !== parseInt(otp)) {
      return res.status(400).send({
        success: false,
        message: "Invalid or unverified OTP.",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    //find patient
    const patient = patientModel.findOne({ patientId });

    const preUsername = slugify(name, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });

    // Create new user
    const user = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 4,
      patient: patient._id,
      username: preUsername + "-" + patientId,
      ref: patientId,
    });

    await user.save();

    // Clear OTP cache for the user after successful registration
    delete global.otpCache[email];

    res.status(201).send({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in registration",
      error,
    });
  }
};

//activate subscription
const activateSubscriptionController = async (req, res) => {
  try {
    const { durationValue, durationUnit } = req.body;
    const { userId } = req.body;

    // Validation
    if (!durationValue || !durationUnit) {
      return res.status(400).json({
        success: false,
        message: "Duration value and unit are required",
      });
    }

    const now = new Date();
    let expiryDate = new Date(now);

    // Calculate expiry date
    switch (durationUnit) {
      case "seconds":
        expiryDate.setSeconds(expiryDate.getSeconds() + durationValue);
        break;
      case "minutes":
        expiryDate.setMinutes(expiryDate.getMinutes() + durationValue);
        break;
      case "hours":
        expiryDate.setHours(expiryDate.getHours() + durationValue);
        break;
      case "days":
        expiryDate.setDate(expiryDate.getDate() + durationValue);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid duration unit",
        });
    }

    // Update user subscription
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      {
        $set: {
          "subscription.isActive": true,
          "subscription.lastActivated": now,
          "subscription.expiryDate": expiryDate,
          "subscription.lastPaymentStatus": "Paid",
          "subscription.duration": {
            value: durationValue,
            unit: durationUnit,
          },
        },
        $unset: {
          subscriptionDeactivatedAt: 1,
        },
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Subscription activated",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Subscription activation error:", error);
    res.status(500).json({
      success: false,
      message: "Error activating subscription",
      error: error.message,
    });
  }
};

//check subscription status
const checkSubscriptionController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // But we should still verify here
    const isActive =
      user.subscription?.isActive && user.subscription.expiryDate > new Date();

    if (!isActive && user.subscription?.isActive) {
      await userModel.findByIdAndUpdate(
        id,
        {
          $set: {
            "subscription.isActive": false,
            "subscription.lastPaymentStatus": "Unpaid",
            subscriptionDeactivatedAt: new Date(),
          },
        },
        { new: true }
      );
    }

    res.json({
      success: true,
      subscription: {
        isActive,
        expiryDate: user.subscription?.expiryDate,
        duration: user.subscription?.duration,
      },
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    res.status(500).json({
      success: false,
      message: "Error checking subscription status",
      error,
    });
  }
};

const getPatientInfo = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patient = await patientModel.findOne({ patientId }); // Added await

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Patient info retrieved",
      patient,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting patient info",
      error: error.message,
    });
  }
};
//set doctor availability
const setAvailability = async (req, res) => {
  try {
    const { doctorId, availability } = req.body;
    const weeklySchedule = availability.weeklySchedule;
    const holidays = availability.holidays;
    const dailyLimit = availability.dailyLimit;

    // Validate input
    if (!weeklySchedule || !Array.isArray(weeklySchedule)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid weekly schedule" });
    }

    const addAvailability = await DoctorAvailability.findOneAndUpdate(
      { doctorId },
      {
        doctorId,
        weeklySchedule,
        holidays: holidays || [],
        dailyLimit: dailyLimit || 10,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, addAvailability });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
//get doctor availability
const getAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availability = await DoctorAvailability.findOne({ doctorId });

    if (!availability) {
      // Return default availability if none exists
      return res.json({
        success: true,
        availability: {
          weeklySchedule: [
            { day: 0, name: "Sunday", enabled: false, slots: [] },
            {
              day: 1,
              name: "Monday",
              enabled: true,
              slots: [{ start: "09:00", end: "17:00" }],
            },
            {
              day: 2,
              name: "Tuesday",
              enabled: true,
              slots: [{ start: "09:00", end: "17:00" }],
            },
            {
              day: 3,
              name: "Wednesday",
              enabled: true,
              slots: [{ start: "09:00", end: "17:00" }],
            },
            {
              day: 4,
              name: "Thursday",
              enabled: true,
              slots: [{ start: "09:00", end: "17:00" }],
            },
            {
              day: 5,
              name: "Friday",
              enabled: true,
              slots: [{ start: "09:00", end: "17:00" }],
            },
            { day: 6, name: "Saturday", enabled: false, slots: [] },
          ],
          holidays: [],
          appointmentDuration: 30,
          dailyLimit: 10,
        },
      });
    }

    res.json({ success: true, availability });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const registerAssistant = async (req, res) => {
  try {
    const { name, email, phone, id, password } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!phone) {
      return res.status(400).send({
        success: false,
        message: "phone is required",
      });
    }
    if (!password) {
      return res.status(400).send({
        success: false,
        message: "password is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "email is required",
      });
    }
    if (!id) {
      return res.status(400).send({
        success: false,
        message: "Doctor Id is required",
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    const preUsername = slugify(name, {
      replacement: "-",
      lower: true,
      strict: true,
      trim: true,
    });

    const assistant = new userModel({
      name,
      email,
      phone,
      password: hashedPassword,
      role: 3,
      username: preUsername + "-" + id,
      doctorRef: id,
    });

    await assistant.save();
    res.status(201).send({
      success: true,
      message: "Assistant registered successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in creating new assisitant",
    });
  }
};

module.exports = {
  registerUser,
  registerPatientUser,
  checkUsername,
  checkEmail,
  sendOtpController,
  verifyOtpController,
  loginController,
  uploadProfilePicController,
  nameUpdateController,
  phoneUpdateController,
  emailUpdateController,
  sendEmailChangeOtpController,
  addressUpdateController,
  degreeUpdateController,
  usernameUpdateController,
  specialityUpdateController,
  titleUpdateController,
  descriptionUpdateController,
  uploadSignaturePicController,
  uploadSlidePicsController,
  deleteSlidePicController,
  patientIdCreate,
  searchPatientByPhone,
  sendPatientOTPCOntroller,
  checkPatientId,
  verifyOtpControllerWithPId,
  registerPatientUser2,
  activateSubscriptionController,
  checkSubscriptionController,
  getPatientInfo,
  setAvailability,
  getAvailability,
  registerAssistant,
};
