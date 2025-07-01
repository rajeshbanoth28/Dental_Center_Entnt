import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PatientView from "./components/PatientView";
import { useAuth } from "./context/AuthContext";
import CalendarView from "./components/CalendarView";
function App() {
  const { user } = useAuth();
  if (!user) return <Login />;

  return (
    <Routes>
      {user.role === "Admin" && <Route path="/" element={<Dashboard />} />}

      {user.role === "Patient" && (
        <Route path="/patient" element={<PatientView />} />
      )}
      <Route
        path="*"
        element={<Navigate to={user.role === "Admin" ? "/" : "/patient"} />}
      />
      <Route path="/calendar" element={<CalendarView />}/>
      
    </Routes>
  );
}

export default App;
