export const getUsers = () => JSON.parse(localStorage.getItem("users")) || [];
export const getPatients = () =>
  JSON.parse(localStorage.getItem("patients")) || [];
export const getIncidents = () =>
  JSON.parse(localStorage.getItem("incidents")) || [];

export const setUsers = (data) =>
  localStorage.setItem("users", JSON.stringify(data));
export const setPatients = (data) =>
  localStorage.setItem("patients", JSON.stringify(data));
export const setIncidents = (data) =>
  localStorage.setItem("incidents", JSON.stringify(data));

export const seedData = () => {
  if (!localStorage.getItem("users")) {
    setUsers([
      { id: "1", role: "Admin", email: "admin@entnt.in", password: "admin123" },
      {
        id: "2",
        role: "Patient",
        email: "john@entnt.in",
        password: "patient123",
        patientId: "p1",
      },
    ]);
  }
  if (!localStorage.getItem("patients")) {
    setPatients([
      {
        id: "p1",
        name: "John Doe",
        dob: "1990-05-10",
        contact: "1234567890",
        healthInfo: "No allergies",
      },
    ]);
  }
  if (!localStorage.getItem("incidents")) {
    setIncidents([
      {
        id: "i1",
        patientId: "p1",
        title: "Toothache",
        description: "Upper molar pain",
        comments: "Sensitive to cold",
        appointmentDate: "2025-07-01T10:00:00",
        cost: 80,
        treatment: "Root canal",
        status: "Completed",
        nextDate: "",
        files: [],
      },
    ]);
  }
};
