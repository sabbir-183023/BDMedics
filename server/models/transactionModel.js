// models/transactionModel.js

const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
    },
    lastNumbers: {
      type: String,
    },
    amount: {
      type: String,
      required: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reason: {
      type: String,
    },
    verification: {
      type: String,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("transaction", transactionSchema);
