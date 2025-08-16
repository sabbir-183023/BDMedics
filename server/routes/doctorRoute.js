const express = require("express");

const {
  allDoctors,
  singleDoctor,
  getAssistants,
  deleteAssistant,
} = require("../controllers/doctorController");
const { isDoctor, requireSignIn } = require("../middlewares/authMiddleware");

const router = express.Router();

//Get All doctors
router.get("/all-doctors/:page", allDoctors);
//Get single doctor info
router.get("/:username", singleDoctor);
//Get assistants list
router.get("/get-assistants/:id", requireSignIn, isDoctor, getAssistants);
//delete an assistant
router.post(
  "/delete-assistant/:deleteId",
  requireSignIn,
  isDoctor,
  deleteAssistant
);

module.exports = router;
