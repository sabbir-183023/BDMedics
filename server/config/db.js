// config/db.js
const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`Connected to MongoDB: ${conn.connection.host}`.bgMagenta.white);
    
    // Return the connection for other modules to use
    return conn;
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`.bgRed.white);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;