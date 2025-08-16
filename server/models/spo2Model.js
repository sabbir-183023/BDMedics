// models/spo2Model.js
const mongoose = require("mongoose");

const spo2Schema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("spo2", spo2Schema);
