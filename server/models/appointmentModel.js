// models/appointmentModel.js
const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
  name: String,
  duration: String,
  morning: String,
  midday: String,
  night: String,
  timing: String,
});

const appointmentSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    bp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "bp",
    },
    height: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "height",
    },
    weight: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "weight",
    },
    temp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "temparature",
    },
    pulse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pulse",
    },
    spo2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "spo2",
    },
    status: {
      type: String,
      enum: ["confirmed", "waiting", "completed", "cancelled", "arrived"],
      default: "confirmed",
    },
    sl: {
      type: String,
      required: true,
    },
    investigations: [String],
    findings: [String],
    medicines: [medicineSchema],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
