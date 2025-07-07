import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import PatientView from "./components/PatientView";
import CalendarView from "./components/CalendarView";
import SignupPage from "./components/SignpPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/"
        element={
          user ? (
            user.role === "Admin" ? (
              <Dashboard />
            ) : (
              <Navigate to="/patient" />
            )
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        }
      />

      <Route
        path="/patient"
        element={
          user ? (
            user.role === "Patient" ? (
              <PatientView />
            ) : (
              <Navigate to="/" />
            )
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        }
      />

      <Route
        path="/calendar"
        element={
          user ? (
            <CalendarView />
          ) : (
            <Navigate to="/login" state={{ from: location }} replace />
          )
        }
      />

      <Route
        path="*"
        element={
          user ? (
            <Navigate to={user.role === "Admin" ? "/" : "/patient"} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;
