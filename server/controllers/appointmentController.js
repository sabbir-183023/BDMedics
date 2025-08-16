const mongoose = require("mongoose");
const DoctorAvailability = require("../models/doctorAvailability.js");
const Appointment = require("../models/appointmentModel.js");
const Patient = require("../models/patientModel.js");
const User = require("../models/userModel.js");
const bpModel = require("../models/bpModel.js");
const heightModel = require("../models/heightModel.js");
const weightModel = require("../models/weightModel.js");
const tempModel = require("../models/temparatureModel.js");
const pulseModel = require("../models/pulseModel.js");
const spo2Model = require("../models/spo2Model.js");

// controllers/availabilityController.js
const checkAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.query;

    // Basic validation
    if (!doctorId || !date) {
      return res.status(400).json({ error: "Doctor ID and date are required" });
    }

    // Get doctor's availability
    const availableSlots = await DoctorAvailability.findOne({ doctorId });
    if (!availableSlots) {
      return res.status(404).json({ error: "Doctor availability not found" });
    }

    // Parse and normalize the date
    const appointmentDate = new Date(date);
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Get appointments for the date (await the query)
    const appointments = await Appointment.find({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: { $ne: "cancelled" }, // make sure this matches your enum exactly
    });

    console.log(appointments);
    console.log(availableSlots.dailyLimit);

    // Check if daily limit is reached
    const isWaitlisted = appointments.length >= availableSlots.dailyLimit;

    // Get day of week (0-6, Sunday-Saturday)
    const dayOfWeek = new Date(date).getDay();
    const daySchedule = availableSlots.weeklySchedule.find(
      (d) => d.day === dayOfWeek
    );

    // Check if day is enabled and has slots
    const isAvailable = daySchedule?.enabled && daySchedule?.slots?.length > 0;

    console.log(isWaitlisted);

    res.json({
      availableSlots,
      isWaitlisted,
      isAvailable,
      availableAppointments: availableSlots.dailyLimit - appointments.length,
      daySchedule,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//book appointment
const bookAppointment = async (req, res) => {
  try {
    const { doctorId, patientId, date, slot, isWaitlisted } = req.body;

    // Convert date to proper format
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check if patient already has an appointment on this date
    const existingAppointment = await Appointment.findOne({
      doctorId,
      patientId,
      date: appointmentDate,
      status: { $ne: "cancelled" },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "You already have an appointment on this date",
      });
    }

    // Get all appointments for this doctor on this date
    const dailyAppointments = await Appointment.find({
      doctorId,
      date: appointmentDate,
      status: { $ne: "cancelled" },
    }).sort({ createdAt: 1 }); // Sort by creation time

    // Calculate serial numbers
    const confirmedAppointments = dailyAppointments.filter(
      (appt) => appt.status === "confirmed"
    );
    const waitingAppointments = dailyAppointments.filter(
      (appt) => appt.status === "waiting"
    );

    let sl;
    if (isWaitlisted) {
      // For waitlisted appointments
      sl = `Waiting ${waitingAppointments.length + 1}`;
    } else {
      // For confirmed appointments
      sl = (confirmedAppointments.length + 1).toString();
    }

    // Create new appointment
    const appointment = new Appointment({
      doctorId,
      patientId,
      date: appointmentDate,
      slot,
      status: isWaitlisted ? "waiting" : "confirmed",
      sl, // Add the serial number
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: isWaitlisted
        ? `You've been added to the waiting list (${sl})`
        : `Appointment booked successfully (Serial: ${sl})`,
      appointment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error booking appointment",
      error: error.message,
    });
  }
};

//get user based appointments
const getAppointments = async (req, res) => {
  try {
    const { patientId } = req.params;

    const appointments = await Appointment.find({ patientId }).populate({
      path: "doctorId",
      select: "name username",
    });

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointments found!",
      });
    }

    // Get current date (without time for accurate comparison)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort appointments: upcoming (ascending) → past (ascending)
    const sortedAppointments = appointments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      // Both dates are upcoming → sort in ascending order
      if (dateA >= today && dateB >= today) {
        return dateA - dateB;
      }
      // Only dateA is upcoming → it should come first
      else if (dateA >= today) {
        return -1;
      }
      // Only dateB is upcoming → it should come first
      else if (dateB >= today) {
        return 1;
      }
      // Both are past → sort in ascending order (oldest first)
      else {
        return dateA - dateB;
      }
    });

    res.status(200).json({
      success: true,
      appointments: sortedAppointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

//get user based appointments for doctors

const getDoctorAppointments = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate doctor ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid doctor ID format",
      });
    }

    const appointments = await Appointment.aggregate([
      // Match appointments for this doctor
      { $match: { doctorId: new mongoose.Types.ObjectId(id) } },

      // Lookup patient information
      {
        $lookup: {
          from: "patients",
          let: { patientRef: "$patientId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $trim: { input: { $toLower: "$patientId" } } },
                    { $trim: { input: { $toLower: "$$patientRef" } } },
                  ],
                },
              },
            },
            { $project: { name: 1, email: 1, phone: 1, patientId: 1 } },
          ],
          as: "patientData",
        },
      },

      // Lookup BP information
      {
        $lookup: {
          from: "bps", // your BP collection name
          localField: "bp",
          foreignField: "_id",
          as: "bpData",
        },
      },

      // Lookup height information
      {
        $lookup: {
          from: "heights", // your height collection name
          localField: "height",
          foreignField: "_id",
          as: "heightData",
        },
      },

      // Lookup weight information
      {
        $lookup: {
          from: "weights", // your weight collection name
          localField: "weight",
          foreignField: "_id",
          as: "weightData",
        },
      },

      // Lookup temperature information
      {
        $lookup: {
          from: "temparatures", // your temperature collection name
          localField: "temp",
          foreignField: "_id",
          as: "tempData",
        },
      },

      // Lookup pulse information
      {
        $lookup: {
          from: "pulses", // your pulse collection name
          localField: "pulse",
          foreignField: "_id",
          as: "pulseData",
        },
      },

      // Lookup SpO2 information
      {
        $lookup: {
          from: "spo2", // your SpO2 collection name
          localField: "spo2",
          foreignField: "_id",
          as: "spo2Data",
        },
      },

      // Unwind all the arrays
      { $unwind: { path: "$patientData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$bpData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$heightData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$weightData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$tempData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$pulseData", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$spo2Data", preserveNullAndEmptyArrays: true } },

      // Project the final structure
      {
        $project: {
          _id: 1,
          doctorId: 1,
          patientId: {
            $ifNull: ["$patientData", { _id: null, patientId: "$patientId" }],
          },
          slot: 1,
          date: 1,
          sl: 1,
          status: 1,
          createdAt: 1,
          updatedAt: 1,
          bp: "$bpData",
          height: "$heightData",
          weight: "$weightData",
          temp: "$tempData",
          pulse: "$pulseData",
          spo2: "$spo2Data",
        },
      },
    ]);

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No appointments found for this doctor",
      });
    }

    // Sort appointments (same as before)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedAppointments = appointments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (dateA >= today && dateB >= today) return dateA - dateB;
      else if (dateA >= today) return -1;
      else if (dateB >= today) return 1;
      else return dateA - dateB;
    });

    res.status(200).json({
      success: true,
      count: sortedAppointments.length,
      appointments: sortedAppointments,
    });
  } catch (error) {
    console.error("Error in getDoctorAppointments:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching appointments",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//get single appointment
const getSingleAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate("bp")
      .populate("height")
      .populate("weight")
      .populate("pulse")
      .populate("temp")
      .populate("spo2");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    const patient = await Patient.findOne({ patientId: appointment.patientId })
      .select("name phone patientId dob")
      .lean();

    const email = await User.findOne({ ref: appointment.patientId })
      .select("email")
      .lean();

    // Combine all data into a single response object
    const response = {
      ...appointment.toObject(),
      patientData: patient || null,
      patientEmail: email || null,
    };

    res.status(200).json({
      success: true,
      appointment: response,
    });
  } catch (error) {
    console.error("Error in getSingleAppointment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while fetching appointment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Update status of appointment
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    if (!id || !status) {
      return res.status(400).json({
        success: false,
        message: "Appointment ID and status are required",
      });
    }

    // Validate status value
    const validStatuses = [
      "confirmed",
      "waiting",
      "completed",
      "cancelled",
      "arrived",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
        validStatuses,
      });
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { status: status },
      { new: true, runValidators: true } // Important options
    );

    if (!updatedAppointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Error while updating status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//update basic info
const basicInfoUpdate = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const {
      systolicBp,
      diastolicBp,
      height,
      weight,
      temp,
      pulse,
      spo2,
      patientId,
    } = req.body;

    // Validation
    if (!patientId || !appointmentId) {
      return res.status(400).json({
        success: false,
        message: "Patient ID and Appointment ID are required!",
      });
    }

    // Get appointment first
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    // Prepare update object
    const updateData = {};

    // Update BP if provided
    if (systolicBp && diastolicBp) {
      await bpModel.deleteMany({ appointmentId });
      const newBp = await bpModel.create({
        patientId,
        systolicBp,
        diastolicBp,
        appointmentId,
      });
      updateData.bp = newBp._id;
    }

    // Update height if provided
    if (height) {
      await heightModel.deleteMany({ appointmentId });
      const newHeight = await heightModel.create({
        patientId,
        value: height,
        appointmentId,
      });
      updateData.height = newHeight._id;
    }

    // Update weight if provided
    if (weight) {
      await weightModel.deleteMany({ appointmentId });
      const newWeight = await weightModel.create({
        patientId,
        value: weight,
        appointmentId,
      });
      updateData.weight = newWeight._id;
    }

    // Update temperature if provided
    if (temp) {
      await tempModel.deleteMany({ appointmentId });
      const newTemp = await tempModel.create({
        patientId,
        value: temp,
        appointmentId,
      });
      updateData.temp = newTemp._id;
    }

    // Update pulse if provided
    if (pulse) {
      await pulseModel.deleteMany({ appointmentId });
      const newPulse = await pulseModel.create({
        patientId,
        value: pulse,
        appointmentId,
      });
      updateData.pulse = newPulse._id;
    }

    // Update SpO2 if provided
    if (spo2) {
      await spo2Model.deleteMany({ appointmentId });
      const newSpo2 = await spo2Model.create({
        patientId,
        value: spo2,
        appointmentId,
      });
      updateData.spo2 = newSpo2._id;
    }

    // Update appointment with new references
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Basic Info Updated Successfully!",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error in basicInfoUpdate:", error);
    res.status(500).json({
      success: false,
      message: "Error in submitting basic info!",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

//appointment update by doctor
const fullAppointmentUpdate = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { appointment } = req.body;
    const existingAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        investigations: appointment.investigations,
        findings: appointment.findings,
        medicines: appointment.medicines,
      },
      { new: true }
    );
    if (existingAppointment) {
      res.status(200).json({
        success: true,
        message: "Prescription Updated Successfully!",
        existingAppointment,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Error in updating appointment!",
      error,
    });
  }
};

module.exports = {
  checkAvailability,
  bookAppointment,
  getAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  basicInfoUpdate,
  getSingleAppointment,
  fullAppointmentUpdate,
};
