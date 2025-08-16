// models/userModel.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    patient: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
    },
    title: {
      type: String,
    },
    description: {
      type: String,
    },
    degree: {
      type: String,
    },
    image: {
      type: String,
      default: "",
    },
    speciality: {
      type: [String],
    },
    signature: {
      type: String,
    },
    slides: {
      type: [String],
    },
    ref: {
      type: String,
    },
    doctorRef: {
      type: String,
    },
    allInfoUpdated: {
      type: Boolean,
      default: false,
    },
    subscription: {
      isActive: {
        type: Boolean,
        default: false,
      },
      lastActivated: Date,
      expiryDate: Date,
      duration: {
        value: Number,
        unit: String,
      },
      lastPaymentStatus: {
        type: String,
        default: "Unpaid",
        enum: ["Unpaid", "Pending Confirmation", "Paid"],
      },
    },
    subscriptionDeactivatedAt: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
