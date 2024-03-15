import MentorSelectPage from "./Pages/MentorSelectPage";
import StudentEvaluationPage from "./Pages/StudentEvaluationPage";
import StudentSelectPage from "./Pages/StudentSelectPage";
import StudentsViewPage from "./Pages/StudentsViewPage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MentorSelectPage />} />
        <Route path="/student-select" element={<StudentSelectPage />} />
        <Route path="/student-view" element={<StudentsViewPage />} />
        <Route path="/student-evaluate/:id" element={<StudentEvaluationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
