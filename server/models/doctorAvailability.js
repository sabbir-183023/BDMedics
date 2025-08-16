// models/doctorAvailability.js
const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  weeklySchedule: [{
    day: {
      type: Number, // 0-6 (Sunday-Saturday)
      required: true
    },
    name: {
      type: String,
      required: true
    },
    enabled: {
      type: Boolean,
      default: false
    },
    slots: [{
      start: {
        type: String,
        required: true
      },
      end: {
        type: String,
        required: true
      }
    }]
  }],
  holidays: [{
    type: Date,
    required: true
  }],
  dailyLimit: {
    type: Number,
    default: 10,
    min: 1
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('DoctorAvailability', availabilitySchema);