// middlewares/authMiddleware.js

const JWT = require("jsonwebtoken");
const userModel = require("../models/userModel");

// Token-based protected routes
const requireSignIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization;

    if (!token) {
      return res.status(401).send({
        success: false,
        message: "Authentication token is missing",
      });
    }

    const decode = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).send({
        success: false,
        message: "jwt expired",
      });
    }

    return res.status(401).send({
      success: false,
      message: "Invalid or malformed token",
    });
  }
};

// Admin access
const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user?.role !== 1) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "You are not an admin",
    });
  }
};

// Doctor access
const isDoctor = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 2) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "You are not an Doctor",
    });
  }
};

// Assistant access
const isAssistant = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 3) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "You are not an Assistant",
    });
  }
};

//Doctor or Assistant
const isDoctorOrAssistant = async (req, res, next) => {
  const user = await userModel.findById(req.user._id);
  if (user.role === 2 || user.role === 3) {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Unauthorized access",
  });
};

// Patient access
const isPatient = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 4) {
      return res.status(401).send({
        success: false,
        message: "Unauthorized Access",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
    return res.status(401).send({
      success: false,
      message: "You are not an Patient",
    });
  }
};

module.exports = {
  requireSignIn,
  isAdmin,
  isDoctor,
  isAssistant,
  isPatient,
  isDoctorOrAssistant,
};
