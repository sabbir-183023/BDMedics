const express = require("express");
const { getAllDoctors,getSingleDoctor } = require("../controllers/adminController");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");

const router = express.Router();

//getting list of all doctors
router.get("/all-doctors/:page", requireSignIn, isAdmin,  getAllDoctors);
//getting single doctor info
router.get("/single-doctor-info/:id", requireSignIn, isAdmin, getSingleDoctor )

module.exports = router;
