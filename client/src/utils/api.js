async function searchMentor(searchQuery) {
  const response = await fetch(`/mentors/search?q=${searchQuery}`);
  let data;
  if(response.status === 200){
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.text();
  }
}

async function getAssignedStudents(mentorId) {
  const response = await fetch(`/mentors/${mentorId}/students`);
  if(response.status === 200){
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.text();
  }
}

async function assignStudent(mentorId, studentIds) {
  const response = await fetch(`/mentors/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ mentorId, studentIds }),
  });
  if(response.status === 200){
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.text();
  }
}

async function unassignStudent(mentorId, studentId) {
  const response = await fetch(`/mentors/unassign/${mentorId}/students/${studentId}`, {
    method: "DELETE",
  });
  if(response.status === 200){
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.text();
  }
}

async function markStudent(mentorId, studentId, marksData) {
  const response = await fetch(`/mentors/${mentorId}/students/${studentId}/marks`, {
    method: "POST",
    body: JSON.stringify(marksData),
    headers: {
      "Content-Type": "application/json",
    },
  });
  if(response.status === 200){
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.text();
  }
}

async function evaluateStudent(mentorId, studentId) {
  const response = await fetch(`/mentors/evaluate/${mentorId}/students/${studentId}`, {
    method: "POST",
  });
  if(response.status === 200){
    await sendMail(studentId);
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.json();
  }
}

async function sendMail(studentId) {
  const response = await fetch(`/students/send-mail-pdf/${studentId}`, {
    method: "POST",
  });
  if(response.status === 200){
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.json();
  }
}

async function searchStudent(searchQuery) {
  const response = await fetch(`/students/search?q=${searchQuery}`);
  if(response.status === 200){
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.json();
  }
}

async function getStudentMarks(id) {
  const response = await fetch(`/students/student-marks/${id}`);
  if(response.status === 200){
    try {
      return await response.json();
    } catch(e) {
      return {};
    }
  } else {
    return await response.json();
  }
}


export {
  searchMentor,
  assignStudent,
  unassignStudent,
  getAssignedStudents,
  markStudent,
  evaluateStudent,
  searchStudent,
  getStudentMarks
}

