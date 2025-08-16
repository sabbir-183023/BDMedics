const specialityModel = require("../models/specialityModel.js");

//adding speciality
const addSpeciality = async (req, res) => {
  try {
    const { name, localName } = req.body;

    const exixtingSpeciality = await specialityModel.findOne({ name });
    if (exixtingSpeciality) {
      return res
        .status(401)
        .json({ success: false, message: "This speciality already exists!" });
    } else {
      const newSpeciality = await specialityModel.create({ name, localName });
      if (!name || !localName) {
        return res.status(401).json({
          success: false,
          message: "Both name & local name are required",
        });
      } else {
        res.status(200).json({
          success: true,
          message: "New speciality added successfully!",
          newSpeciality,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Error in creating new speciality",
      error,
    });
  }
};

//updating speciality
const editSpeciality = async (req, res) => {
  try {
    const { id, editName, editLocalName } = req.body;

    if (editName?.length < 1 || editLocalName?.length < 1) {
      return res
        .status(403)
        .json({
          success: false,
          message: "TItle or Local Name Cannot be Empty!",
        });
    } else {
      const exixtingSpeciality = await specialityModel.findOne({
        name: editName,
      });
      if (exixtingSpeciality) {
        return res
          .status(401)
          .json({ success: false, message: "This speciality already exists!" });
      } else {
        const updatedSpeciality = await specialityModel.findByIdAndUpdate(
          id,
          { name: editName, localName: editLocalName },
          { new: true }
        );

        res.status(200).json({
          success: true,
          message: "Speciality updated successfully!",
          updatedSpeciality,
        });
      }
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Error in editing speciality",
      error,
    });
  }
};

//deleting speciality
const deleteSpeciality = async (req, res) => {
  try {
    const { id } = req.body;

    await specialityModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Speciality Deleted successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Error in Deleting speciality",
      error,
    });
  }
};

//Get All speciality
const getSpeciality = async (req, res) => {
  try {
    const speacilities = await specialityModel.find();

    res.status(200).json({
      success: true,
      message: "Specialities Found successfully!",
      speacilities,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Error in getting speciality",
      error,
    });
  }
};

module.exports = {
  addSpeciality,
  editSpeciality,
  deleteSpeciality,
  getSpeciality,
};
