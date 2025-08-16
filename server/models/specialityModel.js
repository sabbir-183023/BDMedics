// models/specialityModel.js

const mongoose = require("mongoose");

const specialitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    localName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Speciality", specialitySchema);
