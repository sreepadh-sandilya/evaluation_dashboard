

import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Form,
  FormControl,
  Alert,
} from 'react-bootstrap';
import NavigationBar from '../Components/NavigationBar';
import { searchMentor } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import './mentorSelectPage.css'; // Import the CSS file

const MentorSelectPage = () => {
  let mentor = localStorage.getItem('mentor');
  if (mentor) mentor = JSON.parse(mentor);

  const navigate = useNavigate();

  const [searchString, setSearchString] = useState('');
  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(mentor);
  const [message, setMessage] = useState('');
  const [show, setShow] = useState(true);

  const handleMentorSearch = (e) => {
    e.preventDefault();
    fetchMentors(searchString);
  };

  const handleMentorSelect = (mentor) => {
    setSelectedMentor(selectedMentor && selectedMentor.id === mentor.id ? null : mentor);
  };

  const handleConfirmSelection = () => {
    if (selectedMentor) {
      localStorage.setItem('mentor', JSON.stringify(selectedMentor));
      navigate('/student-select');
    } else {
      alert('Please select a mentor');
    }
  };

  const fetchMentors = async (searchString) => {
    const data = await searchMentor(searchString);
    if (typeof data === 'string') {
      setMessage(data);
    } else {
      setMentors(data);
    }
  };

  useEffect(() => {
    fetchMentors('');
  }, []);

  return (
    <>
      <NavigationBar />
      <Container fluid className="container-fluid">
        <Row>
          <Col md={8}>
            {message && show && (
              <Alert variant="danger" className="mt-2 d-flex align-items-center justify-content-between">
                {message}
                <Button className="close" variant="danger" onClick={() => setShow(false)}>
                  <span>&times;</span>
                </Button>
              </Alert>
            )}
            <div className="search-form">
              <h2 className="mt-4 mb-3">Select Mentor</h2>
              <Form className="d-flex" onSubmit={handleMentorSearch}>
                <FormControl type="text" placeholder="Search mentor" className="search-input" value={searchString} onChange={(e) => setSearchString(e.target.value)} />
                <Button variant="outline-success" className="action-button" onClick={handleMentorSearch}>Search</Button>
              </Form>
            </div>
            <div className="d-flex flex-wrap">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className="mentor-card" onClick={() => handleMentorSelect(mentor)}>
                  {/* <Card.Img variant="top" src="/default_image.jpg" alt="default_image" /> */}
                  <Card.Body>
                    <Card.Title>{mentor.name}</Card.Title>
                    <Card.Text>{mentor.email}</Card.Text>
                    <Card.Text>{mentor.phone}</Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    {selectedMentor && selectedMentor.id === mentor.id ? (
                      <Button variant="danger" onClick={() => handleMentorSelect(mentor)}>Deselect</Button>
                    ) : (
                      <Button variant="primary" onClick={() => handleMentorSelect(mentor)}>Select</Button>
                    )}
                  </Card.Footer>
                </Card>
              ))}
            </div>
          </Col>
          <Col md={4} className="text-center">
            {selectedMentor ? (
              <>
                <h2 className="mt-4 mb-3">Selected Mentor</h2>
                <Card className="selected-mentor-card">
                  {/* <Card.Img variant="top" src="/default_image.jpg" alt="default_image" /> */}
                  <Card.Body>
                    <Card.Title>{selectedMentor.name}</Card.Title>
                    <Card.Text>{selectedMentor.email}</Card.Text>
                    <Card.Text>{selectedMentor.phone}</Card.Text>
                    <Card.Footer><Button variant="danger" onClick={() => handleMentorSelect(selectedMentor)}>Deselect</Button></Card.Footer>
                  </Card.Body>
                </Card>
              </>
            ) : (
              <>
                <h2 className="mt-4 mb-3">Selected Mentor</h2>
                <p>No mentor selected</p>
              </>
            )}
            <Button variant="success" className="confirm-button" onClick={handleConfirmSelection}>Confirm Selection</Button>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default MentorSelectPage;
