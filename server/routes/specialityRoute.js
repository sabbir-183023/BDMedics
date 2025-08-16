const express = require("express");

const {
  addSpeciality,
  editSpeciality,
  getSpeciality,
  deleteSpeciality,
} = require("../controllers/specialityController");

const router = express.Router();

//create new speciality
router.post("/add-speciality", addSpeciality);
//Edit speciality
router.put("/edit-speciality", editSpeciality);
//Delete speciality
router.delete("/delete-speciality", deleteSpeciality);
//Get All speciality
router.get("/get-speciality", getSpeciality);

module.exports = router;
