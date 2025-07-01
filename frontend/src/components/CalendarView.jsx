import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  Calendar,
  User,
  Phone,
  FileText,
} from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CalendarView = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("incidents");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const formatted = parsed.map((item) => ({
          ...item,
          appointmentDate: new Date(item.appointmentDate),
        }));
        setAppointments(formatted);
      } catch (e) {
        console.error("Invalid incidents data in localStorage", e);
      }
    }

    const storedPatients = localStorage.getItem("patients");
    if (storedPatients) {
      try {
        setPatients(JSON.parse(storedPatients));
      } catch (err) {
        console.error("Invalid patients data", err);
      }
    }
  }, []);

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : "Unknown Patient";
  };

  const getPatientContact = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.contact : "N/A";
  };

  const getDateKey = (date) => {
    const fixedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return fixedDate.toISOString().split("T")[0];
  };

  const getAppointmentsForDate = (date) => {
    const key = getDateKey(date);
    return appointments.filter(
      (apt) => getDateKey(new Date(apt.appointmentDate)) === key
    );
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  };

  const navigateMonth = (direction) => {
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + direction)));
      setIsAnimating(false);
    }, 150);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "border-green-500 bg-green-50";
      case "pending": return "border-yellow-500 bg-yellow-50";
      case "cancelled": return "border-red-500 bg-red-50";
      default: return "border-blue-500 bg-blue-50";
    }
  };

  const getStatusDot = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-blue-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 px-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200 hover:border-gray-300"
          >
            <Home size={18} />
            <span className="font-medium">Home</span>
          </button>

          <div className="text-center flex-1 mx-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Calendar</h1>
            <p className="text-gray-600">Manage your appointments</p>
          </div>

          <div className="w-24"></div>
        </div>

        <div className="flex justify-between items-center mb-8 bg-white rounded-2xl shadow-lg p-6">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>

          <div className={`text-center transition-all duration-300 ${isAnimating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
            <h2 className="text-2xl font-bold text-gray-800">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-gray-500 text-sm">
              {appointments.length} total appointments
            </p>
          </div>

          <button
            onClick={() => navigateMonth(1)}
            className="p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-110"
          >
            <ChevronRight size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid grid-cols-7 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            {daysOfWeek.map((day) => (
              <div key={day} className="p-4 text-center font-semibold text-sm">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0">
            {getMonthDays().map((date, idx) => {
              const isToday = date?.toDateString() === new Date().toDateString();
              const isSelected = selectedDate && date && getDateKey(date) === getDateKey(selectedDate);
              const dayAppointments = date ? getAppointmentsForDate(date) : [];
              const hasAppointments = dayAppointments.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => date && setSelectedDate(date)}
                  className={`h-32 p-3 border border-gray-100 cursor-pointer transition-all duration-200 relative group
                    ${!date ? "bg-gray-50" : "bg-white hover:bg-gray-50"}
                    ${isToday ? "bg-blue-50 border-blue-200" : ""}
                    ${isSelected ? "bg-blue-100 border-blue-300 shadow-lg" : ""}
                    ${hasAppointments ? "hover:shadow-md" : ""}`}
                >
                  {date && (
                    <div className="flex flex-col h-full">
                      <div className={`flex items-center justify-between mb-2 ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                        <span className={`font-semibold text-sm ${isToday ? "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs" : ""}`}>
                          {date.getDate()}
                        </span>
                        {hasAppointments && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        {dayAppointments.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className={`text-xs p-1 mb-1 rounded truncate ${getStatusColor(apt.status)}`}
                          >
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${getStatusDot(apt.status)}`}></div>
                              <span className="truncate">{apt.title}</span>
                            </div>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-blue-600 font-medium">
                            +{dayAppointments.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 relative">
                <button
                  className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2"
                  onClick={() => setSelectedDate(null)}
                >
                  <X size={20} />
                </button>

                <div className="flex items-center gap-3 mb-2">
                  <Calendar size={24} />
                  <h2 className="text-2xl font-bold">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </h2>
                </div>

                <p className="text-blue-100">
                  {getAppointmentsForDate(selectedDate).length} appointment(s) scheduled
                </p>
              </div>

              <div className="p-6 max-h-96 overflow-y-auto space-y-4">
                {getAppointmentsForDate(selectedDate).map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-6 rounded-xl border-l-4 ${getStatusColor(apt.status)}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{apt.title}</h3>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {apt.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Clock size={16} className="text-blue-500" />
                        <span>
                          {new Date(apt.appointmentDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <User size={16} className="text-blue-500" />
                        <span>{getPatientName(apt.patientId)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <Phone size={16} className="text-blue-500" />
                        <span>{getPatientContact(apt.patientId)}</span>
                      </div>

                      {apt.notes && (
                        <div className="flex items-start gap-3 text-gray-600 md:col-span-2">
                          <FileText size={16} className="text-blue-500 mt-0.5" />
                          <span>{apt.notes}</span>
                        </div>
                      )}

                      {apt.description && (
                        <div className="md:col-span-2">
                          <div className="text-sm font-semibold text-gray-700 mb-1">Description:</div>
                          <div className="text-gray-600">{apt.description}</div>
                        </div>
                      )}

                      {apt.files && apt.files.length > 0 && (
                        <div className="md:col-span-2">
                          <div className="text-sm font-semibold text-gray-700 mb-1">Files:</div>
                          <ul className="list-disc list-inside text-gray-600">
                            {apt.files.map((file, i) => (
                              <li key={i}>
                                <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {file}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {apt.comments && (
                        <div className="md:col-span-2">
                          <div className="text-sm font-semibold text-gray-700 mb-1">Comments:</div>
                          <ul className="list-disc list-inside text-gray-600">
                            {apt.comments}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
