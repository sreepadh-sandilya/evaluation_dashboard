import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Form, Button, Container} from "react-bootstrap";
import NavigationBar from "../Components/NavigationBar";
import { useNavigate } from "react-router-dom";
import { evaluateStudent, getStudentMarks, markStudent } from "../utils/api";
// import nodemailer from "nodemailer";
const StudentEvaluationPage = () => {
  // Get the mentor value from localStorage
  let mentor = localStorage.getItem("mentor");
  if (mentor) mentor = JSON.parse(mentor);

  const navigate = useNavigate();

  // Get the student ID from the URL parameters
  const params = useParams();
  const studentId = params.id;

  // Set up state for the student's evaluation marks
  const [student, setStudent] = useState({
    idea_marks: "",
    execution_marks: "",
    presentation_marks: "",
    communication_marks: "",
    total_marks: "",
  });
  const [select,setselect]=useState(false);

  // Function to handle form submission and save the student's marks
  const handleSubmit = async (event) => {
    event.preventDefault();
    await markStudent(mentor.id, student.id, {
      idea_marks: student.idea_marks,
      execution_marks: student.execution_marks,
      presentation_marks: student.presentation_marks,
      communication_marks: student.communication_marks,
    });
    await  setselect(true);
    await fetchStudentDetails();
  };

  // Function to handle when the evaluation is complete and save the final marks
  const handleCompleteEvaluation = async () => {
    if(select)
    {
    await evaluateStudent(mentor.id, student.id);
    navigate("/student-view");
    }
    else{
      alert("please click submit!");
    }
  };

  // Function to fetch the student's evaluation marks from the server
  const fetchStudentDetails = async () => {
    const data = await getStudentMarks(studentId);
    // Set state with the fetched data, converting any null values to 0
    setStudent({
      ...data,
      // Convert any null values to 0 using the bitwise OR operator
      idea_marks: data.idea_marks | 0,
      execution_marks: data.execution_marks | 0,
      presentation_marks: data.presentation_marks | 0,
      communication_marks: data.communication_marks | 0,
      total_marks: data.total_marks | 0,
    });
  };

  // Use the useEffect hook to fetch the student's marks when the component mounts
  useEffect(() => {
    fetchStudentDetails();
    // eslint-disable-next-line
  }, []);



  return (
    <>
      <NavigationBar />
      <Container fluid>
        <Form onSubmit={handleSubmit} className="p-3">

          <p>student:{student.name}</p>
          <Form.Group controlId="ideaMarks">
            <Form.Label>Idea Marks</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter idea marks"
              value={student?.idea_marks}
              onChange={(e) =>
                setStudent({ ...student, idea_marks: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="executionMarks" className="mt-2">
            <Form.Label>Execution Marks</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter execution marks"
              value={student?.execution_marks}
              onChange={(e) =>
                setStudent({ ...student, execution_marks: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="presentationMarks" className="mt-2">
            <Form.Label>Presentation Marks</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter presentation marks"
              value={student?.presentation_marks}
              onChange={(e) =>
                setStudent({ ...student, presentation_marks: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="communicationMarks" className="mt-2">
            <Form.Label>Communication Marks</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter communication marks"
              value={student?.communication_marks}
              onChange={(e) =>
                setStudent({ ...student, communication_marks: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group controlId="totalMarks" className="mt-2">
            <Form.Label>Total Marks</Form.Label>
            <Form.Control type="text" value={student?.total_marks} disabled />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-3">
            Submit
          </Button>{" "}
          <Button
            variant="success"
            onClick={handleCompleteEvaluation}
            className="mt-3"
          >
            Complete Evaluation
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default StudentEvaluationPage;
