const express = require("express"); // Express framework for Node.js
const bodyParser = require("body-parser"); // Middleware for handling request bodies
const db = require("./config/db"); // Connection to database
const port = 3001; // Port number for the server to listen on

require('dotenv').config(); // Load environment variables from .env file

// Import the route handlers for mentors and students
const mentorRoutes = require("./routes/mentorRoutes");
const studentRoutes = require("./routes/studentRoutes");

const app = express();

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Route handlers for the mentor and student routes
app.use("/mentors", mentorRoutes);
app.use("/students", studentRoutes);

app.get("/", (req, res) => {
  res.send("Server is running...");
});

app.listen(port);
