const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      required: true,
    },
    appointments: {
      type: String,
      default: "",
    },
    dob: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("patient", patientSchema);
