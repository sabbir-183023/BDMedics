const express = require("express");
const {
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
  checkSubscriptionController,
  activateSubscriptionController,
  getPatientInfo,
  getAvailability,
  setAvailability,
  registerAssistant
} = require("../controllers/authController");
const multer = require("multer");
const path = require("path");
const {
  requireSignIn,
  isDoctor,
  isAdmin,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Set storage destination and filename for profilepics
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/profilepics"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
// Set storage destination and filename for siggnature pics
const signStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/signaturepics"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
3;

// storage for slide image upload
const slideStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/slidepics"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const slideUpload = multer({ storage: slideStorage });

const upload = multer({ storage });
const signUpload = multer({ storage: signStorage });

// POST: /api/v1/auth/register
router.post("/register", registerUser);
//check username
router.get("/check-username", checkUsername);
//check email
router.get("/check-email", checkEmail);
// Route to send OTP
router.post("/send-otp", sendOtpController);
// Route to verify OTP
router.post("/verify-otp", verifyOtpController);
// Route for login
router.post("/login", loginController);
//uploading profile pic
router.post(
  "/upload-profile-pic",
  upload.single("profileImage"),
  requireSignIn,
  uploadProfilePicController
);
//name update
router.put("/name-update", requireSignIn, nameUpdateController);
//phone update
router.put("/phone-update", requireSignIn, phoneUpdateController);

//email update
router.put("/email-update", requireSignIn, emailUpdateController);
// Route to send OTP for email change
router.post("/send-otp-for-email-change", sendEmailChangeOtpController);

//address update
router.put("/address-update", requireSignIn, addressUpdateController);
//Degree update
router.put("/degree-update", requireSignIn, isDoctor, degreeUpdateController);
//Username update
router.put(
  "/username-update",
  requireSignIn,
  isDoctor,
  usernameUpdateController
);
//Speciality update
router.put(
  "/speciality-update",
  requireSignIn,
  isDoctor,
  specialityUpdateController
);
//Title update
router.put("/title-update", requireSignIn, isDoctor, titleUpdateController);
//Description update
router.put(
  "/description-update",
  requireSignIn,
  isDoctor,
  descriptionUpdateController
);
//upload signature
router.post(
  "/upload-signature-pic",
  signUpload.single("signatureImage"),
  requireSignIn,
  isDoctor,
  uploadSignaturePicController
);
//upload slide images
router.post(
  "/upload-slide-pics",
  slideUpload.array("slideImages", 5), // Max 5 images
  requireSignIn,
  isDoctor,
  uploadSlidePicsController
);
//delete a single slide pic
router.post(
  "/delete-slide-pic",
  requireSignIn,
  isDoctor,
  deleteSlidePicController
);
//delete a single slide pic
router.post(
  "/assistant-register",
  requireSignIn,
  isDoctor,
  registerAssistant
);

// Subscription activation/update
router.post(
  "/activate-subscription",
  requireSignIn,
  isAdmin,
  activateSubscriptionController
);

// Check subscription status
router.get(
  "/subscription-status/:id",
  requireSignIn,
  checkSubscriptionController
);

//set availability
router.post("/set-availability", setAvailability);
//get availability
router.get("/get-availability/:doctorId", getAvailability);

//Patient items

//Patient ID Creation
router.post("/patientidcreate", patientIdCreate);
//looking for existing patient id
router.post("/searchpatientbyphone", searchPatientByPhone);
//Sending OTP for patient registration
router.post("/send-patient-otp", sendPatientOTPCOntroller);
//patient registration without having patient id
router.post("/patient-register-without-patientId", registerPatientUser);
//patient registration with having patient id
router.post("/patient-register-with-patientId", registerPatientUser2);
//check patient id availability
router.get("/check-patientId", checkPatientId);
// Route to verify OTP for with p id
router.post("/verify-otp-with-pId", verifyOtpControllerWithPId);

//patient info
router.get("/patientInfo/:patientId", getPatientInfo);

module.exports = router;
