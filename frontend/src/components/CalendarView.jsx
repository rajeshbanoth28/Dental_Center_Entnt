import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Eye,
  Edit,
  Trash2,
  MapPin,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month"); // 'month' or 'week'
  const [selectedDay, setSelectedDay] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const navigate = useNavigate();

  // Load appointments from localStorage (THIS WILL NOT WORK in Claude.ai artifacts)
  // In your own environment, uncomment the following code:
  /*
  const loadAppointments = () => {
    try {
      const saved = localStorage.getItem('appointments');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading appointments:', error);
      return [];
    }
  };
  */

  // For Claude.ai artifact demo, starting with empty array
  const [appointments, setAppointments] = useState([]);

  // Save appointments to localStorage (THIS WILL NOT WORK in Claude.ai artifacts)
  // In your own environment, uncomment the following:
  /*
  const saveAppointments = (newAppointments) => {
    try {
      localStorage.setItem('appointments', JSON.stringify(newAppointments));
      setAppointments(newAppointments);
    } catch (error) {
      console.error('Error saving appointments:', error);
    }
  };
  */

  // For Claude.ai artifact demo, just update state
  const saveAppointments = (newAppointments) => {
    setAppointments(newAppointments);
  };

  // Load appointments on component mount (THIS WILL NOT WORK in Claude.ai artifacts)
  // In your own environment, uncomment the following:
  /*
  useEffect(() => {
    const loadedAppointments = loadAppointments();
    setAppointments(loadedAppointments);
  }, []);
  */

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split("T")[0];
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getWeekDays = (date) => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const handleDayClick = (date) => {
    if (!date) return;
    setSelectedDay(date);
    setShowDayModal(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const addSampleAppointment = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const sampleAppointment = {
      id: Date.now(),
      patientName: "Sample Patient",
      treatment: "Routine Checkup",
      date: tomorrow.toISOString().split("T")[0],
      time: "10:00",
      duration: 30,
      status: "confirmed",
      phone: "+1234567890",
      notes: "Sample appointment for testing",
    };

    saveAppointments([...appointments, sampleAppointment]);
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);

    return (
      <div className="grid grid-cols-7 gap-1">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="p-2 text-center font-medium text-gray-600 bg-gray-50"
          >
            {day}
          </div>
        ))}
        {days.map((date, index) => {
          if (!date) {
            return <div key={index} className="p-2 h-24"></div>;
          }

          const dayAppointments = getAppointmentsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              onClick={() => handleDayClick(date)}
              className={`p-2 h-24 border cursor-pointer hover:bg-blue-50 transition-colors ${
                isToday
                  ? "bg-blue-100 border-blue-300"
                  : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`font-medium mb-1 ${
                  isToday ? "text-blue-800" : "text-gray-900"
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayAppointments.slice(0, 2).map((apt) => (
                  <div
                    key={apt.id}
                    className="text-xs px-1 py-0.5 rounded bg-blue-100 text-blue-800 truncate"
                  >
                    {apt.time} - {apt.patientName}
                  </div>
                ))}
                {dayAppointments.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayAppointments.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = getWeekDays(currentDate);

    return (
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayAppointments = getAppointmentsForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div key={index} className="border border-gray-200">
              <div
                className={`p-3 text-center font-medium cursor-pointer hover:bg-blue-50 ${
                  isToday
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-50 text-gray-900"
                }`}
                onClick={() => handleDayClick(date)}
              >
                <div className="text-sm">{daysOfWeek[date.getDay()]}</div>
                <div className="text-lg">{date.getDate()}</div>
              </div>
              <div className="p-2 min-h-96 bg-white">
                <div className="space-y-2">
                  {dayAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="p-2 rounded border-l-4 border-blue-400 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                      onClick={() => handleDayClick(date)}
                    >
                      <div className="font-medium text-sm text-blue-900">
                        {apt.time}
                      </div>
                      <div className="text-sm text-gray-700">
                        {apt.patientName}
                      </div>
                      <div className="text-xs text-gray-600">
                        {apt.treatment}
                      </div>
                      <div
                        className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => {
              navigate(-1);
            }}
            className=""
          >
            Back
          </button>
          <div className="flex items-center space-x-4">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Calendar
              </h1>
              <p className="text-gray-600">Manage appointments and schedules</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={addSampleAppointment}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Sample</span>
            </button>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() =>
                  view === "month" ? navigateMonth(-1) : navigateWeek(-1)
                }
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 min-w-60 text-center">
                {view === "month"
                  ? `${
                      months[currentDate.getMonth()]
                    } ${currentDate.getFullYear()}`
                  : `Week of ${currentDate.toLocaleDateString()}`}
              </h2>
              <button
                onClick={() =>
                  view === "month" ? navigateMonth(1) : navigateWeek(1)
                }
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setView("month")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Week
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg border border-gray-200">
        {view === "month" ? renderMonthView() : renderWeekView()}
      </div>

      {/* Day Detail Modal */}
      {showDayModal && selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {formatDate(selectedDay)}
                </h3>
                <button
                  onClick={() => setShowDayModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {getAppointmentsForDate(selectedDay).length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No appointments scheduled for this day</p>
                  </div>
                ) : (
                  getAppointmentsForDate(selectedDay).map((apt) => (
                    <div
                      key={apt.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              {apt.time}
                            </span>
                          </div>
                          <div
                            className={`px-2 py-1 rounded text-xs ${getStatusColor(
                              apt.status
                            )}`}
                          >
                            {apt.status}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {apt.duration} min
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {apt.patientName}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{apt.treatment}</span>
                        </div>
                        {apt.phone && (
                          <div className="text-sm text-gray-600">
                            📞 {apt.phone}
                          </div>
                        )}
                        {apt.notes && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            {apt.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No appointments yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by adding some sample appointments to see the calendar in
            action
          </p>
          <button
            onClick={addSampleAppointment}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Sample Appointment
          </button>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
