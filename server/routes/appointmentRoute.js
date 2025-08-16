const express = require("express");
const {
  checkAvailability,
  bookAppointment,
  getAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  basicInfoUpdate,
  getSingleAppointment,
  fullAppointmentUpdate,
} = require("../controllers/appointmentController");
const {
  requireSignIn,
  isPatient,
  isDoctorOrAssistant,
  isDoctor,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Check available slots for a date
router.get("/availability", checkAvailability);
// Book appointment
router.post("/book", bookAppointment);
// get appointments based on a single patient
router.get(
  "/get-user-appointments/:patientId",
  requireSignIn,
  isPatient,
  getAppointments
);
// get appointments for doctors
router.get(
  "/get-doctor-appointments/:id",
  requireSignIn,
  isDoctorOrAssistant,
  getDoctorAppointments
);
// get single appointment for doctors
router.get(
  "/get-appointment/:id",
  requireSignIn,
  isDoctor,
  getSingleAppointment
);
router.put(
  "/update-appointment-status/:id",
  requireSignIn,
  updateAppointmentStatus
);
//update basic info by assistant
router.post(
  "/submit-basic-info/:appointmentId",
  requireSignIn,
  isDoctorOrAssistant,
  basicInfoUpdate
);
//update appointment by doctor
router.post(
  "/update-appointment/:appointmentId",
  requireSignIn,
  isDoctor,
  fullAppointmentUpdate
);

module.exports = router;
