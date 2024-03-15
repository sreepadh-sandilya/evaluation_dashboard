const express = require("express");
const { searchStudent, getStudentMarks, generatePDFandMail } = require("../controllers/studentControllers");
const router = express.Router();

// Endpoint for getting students by search string
router.get("/search", searchStudent);

// Endpoint for getting student marks by student id
router.get("/student-marks/:id", getStudentMarks);

// Endpoint for generating PDF and sending email with PDF attached
router.post("/send-mail-pdf/:id", generatePDFandMail);

module.exports = router;