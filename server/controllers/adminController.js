const userModel = require("../models/userModel.js");

// doctorController.js
const getAllDoctors = async (req, res) => {
  try {
    const page = parseInt(req.params.page) || 1;
    const limit = 100;
    const skip = (page - 1) * limit;

    const doctors = await userModel.aggregate([
      { $match: { role: 2 } },
      { $project: { password: 0 } }, // Exclude password
      {
        $addFields: {
          paymentStatusOrder: {
            $switch: {
              branches: [
                {
                  case: {
                    $eq: [
                      "$subscription.lastPaymentStatus",
                      "Pending Confirmation",
                    ],
                  },
                  then: 1,
                },
                {
                  case: { $eq: ["$subscription.lastPaymentStatus", "Paid"] },
                  then: 2,
                },
                {
                  case: { $eq: ["$subscription.lastPaymentStatus", "Unpaid"] },
                  then: 3,
                },
              ],
              default: 4,
            },
          },
        },
      },
      { $sort: { paymentStatusOrder: 1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
    ]);

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

/// Get single doctor info
const getSingleDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await userModel
      .findOne({
        _id: id,
        role: 2,
      })
      .select("-password");

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      doctor,
    });
  } catch (error) {
    console.error("Error fetching doctor:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching doctor information",
      error,
    });
  }
};

module.exports = { getAllDoctors, getSingleDoctor };
