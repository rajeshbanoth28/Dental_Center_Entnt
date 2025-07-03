import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getPatients, getIncidents } from "../utils/storage";
import {
  Calendar,
  Clock,
  FileText,
  User,
  LogOut,
  DollarSign,
  ChevronRight,
  Activity,
  Download,
} from "lucide-react";
import IncidentEditor from "./IncidentEditor";

const PatientView = () => {
  const { user, logout } = useAuth();
  const [patient, setPatient] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    upcoming: 0,
    totalCost: 0,
  });

  const [showEditor, setShowEditor] = useState(false);

  const loadIncidents = () => {
    const allPatients = getPatients();
    const thisPatient = allPatients.find((p) => p.id === user.patientId);
    setPatient(thisPatient);

    const myIncidents = getIncidents()
      .filter((i) => i.patientId === user.patientId)
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));

    setIncidents(myIncidents);

    const future = myIncidents.find(
      (i) => new Date(i.appointmentDate) > new Date()
    );
    setNextAppointment(future || null);

    const completed = myIncidents.filter((i) => i.status === "Completed").length;
    const upcoming = myIncidents.filter((i) => new Date(i.appointmentDate) > new Date()).length;
    const totalCost = myIncidents.reduce((sum, i) => sum + (i.cost || 0), 0);

    setStats({
      total: myIncidents.length,
      completed,
      upcoming,
      totalCost,
    });
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleCreate = () => {
    setShowEditor(true);
  };

  const handleClose = () => {
    setShowEditor(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Scheduled":
        return "🗓️";
      case "In Progress":
        return "⏳";
      case "Completed":
        return "✅";
      case "Cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = "blue" }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600 mt-1`}>{value}</p>
        </div>
        <div className={`p-3 bg-${color}-50 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {patient?.name || "Patient"}
                </h1>
                <p className="text-gray-600 mt-1">Manage your healthcare journey</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {!showEditor && (
                <button
                  onClick={handleCreate}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Appointment</span>
                </button>
              )}
              <button
                onClick={logout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {showEditor && (
          <IncidentEditor
            patientId={user.patientId}
            onClose={handleClose}
            onSave={() => {
              loadIncidents();
              setShowEditor(false);
            }}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Activity} title="Total Appointments" value={stats.total} color="blue" />
          <StatCard icon={Calendar} title="Completed" value={stats.completed} color="emerald" />
          <StatCard icon={Clock} title="Upcoming" value={stats.upcoming} color="amber" />
          <StatCard icon={DollarSign} title="Total Cost" value={`₹${stats.totalCost.toLocaleString()}`} color="purple" />
        </div>

        {nextAppointment && (
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Next Appointment</h2>
                </div>
                <h3 className="text-2xl font-bold mb-2">{nextAppointment.title}</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-2 sm:space-y-0 text-blue-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(nextAppointment.appointmentDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="h-4 w-4 text-center">
                      {getStatusIcon(nextAppointment.status)}
                    </span>
                    <span>{nextAppointment.status}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 mt-2" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-6 w-6 text-gray-700" />
              <h2 className="text-xl font-bold text-gray-900">Appointment History</h2>
            </div>
            <span className="text-sm text-gray-500">{incidents.length} total records</span>
          </div>

          {incidents.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">No appointments recorded yet</p>
              <p className="text-gray-400 text-sm mt-2">Your appointment history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{inc.title}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            inc.status
                          )}`}
                        >
                          {getStatusIcon(inc.status)} {inc.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(inc.appointmentDate)}</span>
                        </div>
                        {inc.cost && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span>₹{inc.cost.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                      {inc.description && <p className="text-sm text-gray-700">🗒️ {inc.description}</p>}
                      {inc.treatment && <p className="text-sm text-blue-800">💉 {inc.treatment}</p>}
                      {inc.nextDate && <p className="text-sm text-amber-800">Next Visit: {inc.nextDate}</p>}
                    </div>
                    {inc.files?.length > 0 && (
                      <div className="lg:w-64">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Attachments</h4>
                        <div className="space-y-2">
                          {inc.files.map((file, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                const link = document.createElement("a");
                                link.href = file.url;
                                link.download = file.name;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm p-2 bg-blue-50 rounded-lg transition-colors"
                            >
                              <Download className="h-4 w-4" />
                              <span className="truncate">{file.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientView;
