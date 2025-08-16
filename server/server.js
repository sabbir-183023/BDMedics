const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const colors = require("colors");
const morgan = require("morgan");
const connectDB = require("./config/db.js");
const path = require("path");

// config env
require("dotenv").config();

//rest object
const app = express();

//middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(bodyParser.json());

// Routes
app.use("/api/v1/auth", require("./routes/authRoute"));
app.use("/api/v1/speciality", require("./routes/specialityRoute"));
app.use("/api/v1/doctor", require("./routes/doctorRoute"));
app.use("/api/v1/admin", require("./routes/adminRoute"));
app.use("/api/v1/transaction", require("./routes/transactionRoute"));
app.use("/api/v1/appointment", require("./routes/appointmentRoute"));
//routes for images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//rest api
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to Liz fashions",
  });
});

//PORT
const PORT = process.env.PORT || 3000;

// Database connection
connectDB().then(() => {
  // Initialize subscription checker
  const { initSubscriptionCronJob } = require('./helpers/subscriptionService');
  initSubscriptionCronJob();

  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`.bgYellow.white);
  });
});
