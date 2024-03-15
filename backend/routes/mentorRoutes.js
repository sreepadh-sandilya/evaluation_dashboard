const express = require("express");
const {
  getAssignedStudents,
  assignStudent,
  unassignStudent,
  markStudent,
  evaluateStudent,
  searchMentor
} = require("../controllers/mentorControllers");
const router = express.Router();

// Endpoint for searching mentors
router.get("/search", searchMentor);

// Endpoint for getting assigned students for a mentor
router.get("/:mentorId/students", getAssignedStudents);

// Endpoint for assigning students to a mentor
router.post("/assign", assignStudent);

// Endpoint for unassigning a student from a mentor
router.delete("/unassign/:mentorId/students/:studentId", unassignStudent);

// Endpoint for marking a student's evaluation criteria
router.post("/:mentorId/students/:studentId/marks", markStudent);

// Endpoint for evaluating a student's performance
router.post("/evaluate/:mentorId/students/:studentId", evaluateStudent);

module.exports = router;
