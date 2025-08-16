const userModel = require("../models/userModel.js");

// get all doctors
const allDoctors = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 8; // Load 10 doctors at a time
    const skip = (page - 1) * limit;

    const doctors = await userModel
      .find({ role: 2, allInfoUpdated: true })
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      doctors,
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching doctors:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctors list",
    });
  }
};

const singleDoctor = async (req, res) => {
  try {
    const { username } = req.params;
    const doctor = await userModel
      .findOne({ username, role: 2, allInfoUpdated: true })
      .select("-password")
      .select("-phone");
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found or profile not fully updated",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "error in fetching single doctor",
      error,
    });
  }
};

//get assistant information
const getAssistants = async (req, res) => {
  try {
    const { id } = req.params;

    const assistants = await userModel
      .find({ doctorRef: id })
      .select("-password");

    if (!assistants || assistants.length === 0) {
      // Changed condition
      return res.status(404).json({
        // Added return
        success: false,
        message: "Couldn't find assistants",
      });
    }

    return res.status(200).json({
      // Added return for consistency
      success: true,
      assistants,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      // Added return
      success: false,
      message: "Error in fetching assistants", // Fixed message
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

//delete an assistant
const deleteAssistant = async (req, res) => {
  try {
    const { deleteId } = req.params;

    // Check if the ID is provided
    if (!deleteId) {
      return res.status(400).json({
        success: false,
        message: "Assistant ID is required",
      });
    }

    // Check if the assistant exists before attempting to delete
    const existingAssistant = await userModel.findById(deleteId);
    if (!existingAssistant) {
      return res.status(404).json({
        success: false,
        message: "Assistant not found",
      });
    }

    const deletedAssistant = await userModel.findByIdAndDelete(deleteId);

    if (!deletedAssistant) {
      return res.status(404).json({
        success: false,
        message: "Assistant not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Assistant deleted successfully!",
      data: deletedAssistant,
    });
  } catch (error) {
    console.error("Error deleting assistant:", error);

    // Handle specific errors like invalid ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Assistant ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while deleting assistant",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  allDoctors,
  singleDoctor,
  getAssistants,
  deleteAssistant,
};
