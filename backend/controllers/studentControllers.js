const db = require("../config/db");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const nodemailer = require("nodemailer");

// Controller for getting students by search string
const searchStudent = (req, res) => {
  const searchQuery = req.query.q;
  const searchParam = `%${searchQuery.toLowerCase()}%`;

  const searchStudentQuery = `
    SELECT * FROM students
    WHERE LOWER(name) LIKE ?
    OR LOWER(email) LIKE ?
  `;

  db.query(searchStudentQuery, [searchParam, searchParam], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    res.status(200).json(result);
  });
};

// Controller for getting student marks by student id
const getStudentMarks = (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT s.id, s.name, s.email, s.phone, sm.idea_marks, sm.execution_marks, sm.presentation_marks, sm.communication_marks, sm.total_marks
    FROM students AS s
    LEFT JOIN student_marks AS sm ON s.id = sm.student_id
    WHERE s.id = ?
  `;

  db.query(query, [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    res.status(200).json(result[0]);
  });
};

// Controller for generating PDF and sending email with PDF attached
const generatePDFandMail = async (req, res) => {
  const studentId = req.params.id;

  const query = `
  SELECT s.id, s.name, s.email, s.phone, sm.idea_marks, sm.execution_marks, sm.presentation_marks, sm.communication_marks, sm.total_marks
  FROM students AS s
  LEFT JOIN student_marks AS sm ON s.id = sm.student_id
  WHERE s.id = ?
`;

  db.query(query, [studentId], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Internal Server Error");
    }

    const student = result[0];
    const doc = new PDFDocument();
    doc.text(`Student Name: ${student.name}`, { align: "center" });
    doc.text(`Student Email: ${student.email}`, { align: "center" });
    doc.text(`Idea Score: ${student.idea_marks}`, { align: "center" });
    doc.text(`Execution Score: ${student.execution_marks}`, {
      align: "center",
    });
    doc.text(`Presentation Score: ${student.presentation_marks}`, {
      align: "center",
    });
    doc.text(`Communication Score: ${student.communication_marks}`, {
      align: "center",
    });
    doc.text(`Total Score: ${student.total_marks}`, { align: "center" });

    // Create a buffer to store the PDF document
    let pdfBuffer = null;
    doc.on("data", function (chunk) {
      if (pdfBuffer === null) {
        pdfBuffer = chunk;
      } else {
        pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
      }
    });

    doc.on("end", function () {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.APP_PASS,
        },
      });

      // Create the mail options object with the PDF attachment
      const mailOptions = {
        from: process.env.EMAIL,
        to: student.email,
        subject: "Your evaluation is complete",
        text: "Your final score is attached as a PDF",
        attachments: [
          {
            filename: "final-score.pdf",
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      };

      // Send the email with the PDF attachment
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.status(500).json({ message: "Failed to send email" });
        } else {
          console.log("Email sent: " + info.response);
          res
            .status(200)
            .json({ message: "Evaluation completed and email sent" });
        }
      });
    });

    doc.end();
  });
};

module.exports = { searchStudent, getStudentMarks, generatePDFandMail };
