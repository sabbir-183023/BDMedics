// models/bpmodel.js
const mongoose = require("mongoose");

const bpSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
    },
    systolicBp: {
      type: Number,
      required: true,
    },
    diastolicBp: {
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

module.exports = mongoose.model("bp", bpSchema);
