// models/temparatureModel.js
const mongoose = require("mongoose");

const temparatureSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("temparature", temparatureSchema);
