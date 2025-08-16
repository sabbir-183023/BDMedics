const transactionModel = require("../models/transactionModel");
const userModel = require("../models/userModel");
// const userModel = require("../models/userModel");

//subscription payment controller
const subscriptionOrder = async (req, res) => {
  try {
    const { paymentMethod, lastNumbers, amount } = req.body;
    if (!lastNumbers) {
      return res.status(401).json({
        success: false,
        message: "Last number is required",
      });
    }
    if (!amount) {
      return res.status(401).json({
        success: false,
        message: "Amount is required",
      });
    }
    const refId = req.user._id;
    await userModel.findByIdAndUpdate(refId, {
      $set: {
        "subscription.lastPaymentStatus": "Pending Confirmation",
      },
    });

    const reason = "Payment of subscription purchase";
    verification = "Pending";
    const transaction = await transactionModel.create({
      paymentMethod,
      lastNumbers,
      amount,
      refId,
      reason,
      verification,
    });
    if (transaction) {
      res.status(200).json({
        success: true,
        message: "Subscription order successfully placed",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error in posting subscription order",
    });
  }
};

//get 5 transactions

const getTransactionsByUserId = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 5 } = req.query;

    // Validate ID
    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const transactions = await transactionModel
      .find({ refId: id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate({
        path: "verifiedBy",
        select: "name _id",
      })
      .exec();

    const total = await transactionModel.countDocuments({ refId: id });

    res.status(200).json({
      success: true,
      transactions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in getting transactions",
    });
  }
};

//update transaction status
const uptadeVerification = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { verification } = req.body;
    const adminId = req.user._id;
    const transaction = await transactionModel.findByIdAndUpdate(
      transactionId,
      {
        $set: {
          verification: verification,
          verifiedBy: adminId,
        },
      }
    );

    if (verification === "Rejected") {
      const userId = transaction.refId;
      const updatedUser = await userModel.findByIdAndUpdate(userId, {
        $set: {
          "subscription.lastPaymentStatus": "Unpaid",
        },
      });
      console.log(updatedUser);
    }

    if (transaction) {
      res.status(200).json({
        success: true,
        message: "Transaction status updated!",
        transaction,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in updating transaction status",
    });
  }
};

module.exports = {
  subscriptionOrder,
  getTransactionsByUserId,
  uptadeVerification,
};
