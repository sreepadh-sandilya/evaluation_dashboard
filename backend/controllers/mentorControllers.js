const db = require("../config/db");

// Controller for searching mentors
const searchMentor = (req, res) => {
  const searchQuery = req.query.q.toLowerCase();

  const searchMentorQuery = `SELECT * FROM mentors WHERE LOWER(name) LIKE '%${searchQuery}%' OR LOWER(email) LIKE '%${searchQuery}%'`;

  db.query(searchMentorQuery, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    res.status(200).send(result);
  });
};

// Controller for getting assigned students for a mentor
const getAssignedStudents = (req, res) => {
  const mentorId = req.params.mentorId;

  // First, check if the mentor exists
  const checkMentorQuery = `SELECT * FROM mentors WHERE id = ${mentorId}`;
  db.query(checkMentorQuery, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    // If the mentor doesn't exist, send a 404 error
    if (result.length === 0) {
      res.status(404).send("Mentor not found");
      return;
    }

    // If the mentor exists, get all the students assigned to them along with their marks
    const getStudentsQuery = `
      SELECT students.id, students.name, students.email, students.phone, students.evaluated_by, student_marks.idea_marks, student_marks.execution_marks, student_marks.presentation_marks, student_marks.communication_marks, student_marks.total_marks
      FROM students
      LEFT JOIN student_marks ON students.id = student_marks.student_id
      WHERE students.mentor_id = ${mentorId}
    `;
    db.query(getStudentsQuery, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
      }

      // Return the list of students and their marks
      res.status(200).send(result);
    });
  });
};

// Controller for assigning students to a mentor
const assignStudent = (req, res) => {
  const { mentorId, studentIds } = req.body;

  // Check if the mentor exists in the database
  const getMentorQuery = `SELECT * FROM mentors WHERE id = ${mentorId}`;
  db.query(getMentorQuery, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal server error");
    }

    if (result.length === 0) {
      return res.status(404).send(`Mentor with ID ${mentorId} not found`);
    }

    // Check if the mentor already has 4 students assigned
    const countStudentsQuery = `SELECT COUNT(*) as count FROM students WHERE mentor_id = ${mentorId}`;
    db.query(countStudentsQuery, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
      }

      let { count } = result[0];
      if (count > 3) {
        return res.status(400).send("Mentor already has 4 students assigned");
      }

      // Check if the students already have a mentor assigned
      const getStudentsQuery = `SELECT * FROM students WHERE id IN (${studentIds.join(
        ","
      )}) AND mentor_id IS NOT NULL`;
      db.query(getStudentsQuery, (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Internal server error");
        }

        if (result.length > 0) {
          return res
            .status(400)
            .send("One or more students already have a mentor assigned");
        }

        // Check if the students have already been evaluated
        const getEvaluatedStudentsQuery = `SELECT * FROM students WHERE id IN (${studentIds.join(
          ","
        )}) AND evaluated_by IS NOT NULL`;
        db.query(getEvaluatedStudentsQuery, (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send("Internal server error");
          }

          if (result.length > 0) {
            return res
              .status(400)
              .send("One or more students have already been evaluated");
          }

          // Check if number of students to be assigned + number of already assigned students > 4
          if(studentIds.length + count > 4){
            return res
              .status(400)
              .send("Total students are greater than 4");
          }

          // Assign the students to the mentor
          const assignStudentsQuery = `UPDATE students SET mentor_id = ${mentorId} WHERE id IN (${studentIds.join(
            ","
          )})`;
          db.query(assignStudentsQuery, (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).send("Internal server error");
            }

            return res
              .status(200)
              .send("Students assigned to mentor successfully");
          });
        });
      });
    });
  });
};

// Controller for unassigning a student from a mentor
const unassignStudent = (req, res) => {
  const mentorId = req.params.mentorId;
  const studentId = req.params.studentId;

  // First, check if the mentor exists
  const checkMentorQuery = `SELECT * FROM mentors WHERE id = ${mentorId}`;
  db.query(checkMentorQuery, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    // If the mentor doesn't exist, send a 404 error
    if (result.length === 0) {
      res.status(404).send("Mentor not found");
      return;
    }

    // If the mentor exists, check if the student is assigned to them
    const checkStudentQuery = `SELECT * FROM students WHERE id = ${studentId} AND mentor_id = ${mentorId}`;
    db.query(checkStudentQuery, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
      }

      // If the student is not assigned to the mentor, send a 404 error
      if (result.length === 0) {
        res.status(404).send("Student not assigned to this mentor");
        return;
      }

      // Remove the student from the mentor's list of assigned students
      const removeStudentQuery = `UPDATE students SET mentor_id = NULL WHERE id = ${studentId}`;
      db.query(removeStudentQuery, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Internal Server Error");
        }

        res.status(200).send("Student successfully removed from mentor");
      });
    });
  });
};

// Controller for marking a student's evaluation criteria
const markStudent = (req, res) => {
  const mentorId = req.params.mentorId;
  const studentId = req.params.studentId;
  const {
    idea_marks,
    execution_marks,
    presentation_marks,
    communication_marks,
  } = req.body;

  // First, check if the mentor exists
  const checkMentorQuery = `SELECT * FROM mentors WHERE id = ${mentorId}`;
  db.query(checkMentorQuery, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    // If the mentor doesn't exist, send a 404 error
    if (result.length === 0) {
      res.status(404).send("Mentor not found");
      return;
    }

    // If the mentor exists, check if the student is assigned to them
    const checkStudentQuery = `SELECT * FROM students WHERE id = ${studentId} AND mentor_id = ${mentorId}`;
    db.query(checkStudentQuery, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
      }

      // If the student is not assigned to the mentor, send a 404 error
      if (result.length === 0) {
        res.status(404).send("Student not assigned to this mentor");
        return;
      }

      // If the student is assigned to the mentor, check if the student evaluation has been completed already
      const checkStudentEvaluationCompleted = `SELECT * FROM students WHERE id = ${studentId} AND evaluated_by IS NOT NULL`;
      db.query(checkStudentEvaluationCompleted, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Internal Server Error");
        } else if (result.length > 0) {
          return res
            .status(400)
            .send("Student evaluation has already been completed");
        }
      });

      // If the student evaluation has not been completed, then check if student has been marked
      const checkMarkedQuery = `SELECT * FROM student_marks WHERE student_id = ${studentId}`;
      db.query(checkMarkedQuery, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Internal Server Error");
        }

        // If the student has already been marked, update the marks
        if (result.length > 0) {
          let updateMarksQuery = `UPDATE student_marks SET`;

          if (idea_marks !== undefined) {
            updateMarksQuery += ` idea_marks = ${idea_marks},`;
          }
          if (execution_marks !== undefined) {
            updateMarksQuery += ` execution_marks = ${execution_marks},`;
          }
          if (presentation_marks !== undefined) {
            updateMarksQuery += ` presentation_marks = ${presentation_marks},`;
          }
          if (communication_marks !== undefined) {
            updateMarksQuery += ` communication_marks = ${communication_marks},`;
          }

          updateMarksQuery = updateMarksQuery.slice(0, -1);
          updateMarksQuery += ` WHERE student_id = ${studentId}`;

          db.query(updateMarksQuery, (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send("Internal Server Error");
            }

            res.status(200).send("Marks successfully updated for student");
          });
        } else {
          // If the student has not been marked, add the marks to the marks table
          const addMarksQuery = `INSERT INTO student_marks (student_id, idea_marks, execution_marks, presentation_marks, communication_marks) VALUES (${studentId}, ${
            idea_marks | null
          }, ${execution_marks | null}, ${presentation_marks | null}, ${
            communication_marks | null
          })`;

          db.query(addMarksQuery, (err, result) => {
            if (err) {
              console.log(err);
              return res.status(500).send("Internal Server Error");
            }

            res.status(200).send("Marks successfully added for student");
          });
        }
      });
    });
  });
};

// Controller for evaluating a student's performance
const evaluateStudent = (req, res) => {
  const studentId = req.params.studentId;
  const mentorId = req.params.mentorId;

  // Check if the student exists
  const checkStudentQuery = `SELECT * FROM students WHERE id = ${studentId}`;
  db.query(checkStudentQuery, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    // If the student doesn't exist, send a 404 error
    if (result.length === 0) {
      res.status(404).send("Student not found");
      return;
    }

    // If the student exists, check if the mentor exists
    const checkMentorQuery = `SELECT * FROM mentors WHERE id = ${mentorId}`;
    db.query(checkMentorQuery, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error");
      }

      // If the mentor doesn't exist, send a 404 error
      if (result.length === 0) {
        res.status(404).send("Mentor not found");
        return;
      }

      // If the mentor exists, check if the student is assigned to them
      const checkStudentMentorQuery = `SELECT * FROM students WHERE id = ${studentId} AND mentor_id = ${mentorId}`;
      db.query(checkStudentMentorQuery, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Internal Server Error");
        }

        // If the student is not assigned to the mentor, send a 404 error
        if (result.length === 0) {
          res.status(404).send("Student not assigned to this mentor");
          return;
        }

        // If the student is assigned to the mentor, update the evaluated_by column of the student with the mentor_id
        const updateEvaluatedByQuery = `UPDATE students SET evaluated_by = ${mentorId} WHERE id = ${studentId}`;
        db.query(updateEvaluatedByQuery, (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).send("Internal Server Error");
          }

          res
            .status(200)
            .send(
              `Student ${studentId} successfully marked as evaluated by mentor ${mentorId}`
            );
        });
      });
    });
  });
};

module.exports = {
  searchMentor,
  getAssignedStudents,
  assignStudent,
  unassignStudent,
  markStudent,
  evaluateStudent,
};
