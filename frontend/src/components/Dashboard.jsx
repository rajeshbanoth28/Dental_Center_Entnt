import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import {
  getPatients,
  setPatients,
  getIncidents,
  setIncidents,
} from "../utils/storage";
import PatientForm from "./PatientForm";
import IncidentEditor from "./IncidentEditor";

import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { logout } = useAuth();
  const [patients, setPatientsState] = useState([]);
  const [incidents, setIncidentsState] = useState([]);
  const [editing, setEditing] = useState(null);
  const [addingIncidentFor, setAddingIncidentFor] = useState(null);
  const [editingIncident, setEditingIncident] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setPatientsState(getPatients());
    const storedIncidents = getIncidents();
    // Ensure approvalStatus is set for all incidents
    const updatedIncidents = storedIncidents.map((i) => ({
      ...i,
      approvalStatus: i.approvalStatus || "Pending",
    }));
    setIncidentsState(updatedIncidents);
    setIncidents(updatedIncidents);
  }, []);

  const savePatient = (updated) => {
    const isNew = !updated.id;
    const data = isNew
      ? [...patients, { ...updated, id: `p${Date.now()}` }]
      : patients.map((p) => (p.id === updated.id ? updated : p));
    setPatients(data);
    setPatientsState(data);
    setEditing(null);
  };

  const removePatient = (id) => {
    const filtered = patients.filter((p) => p.id !== id);
    setPatients(filtered);
    setPatientsState(filtered);
  };

  const removeIncident = (id) => {
    const filtered = incidents.filter((i) => i.id !== id);
    setIncidents(filtered);
    setIncidentsState(filtered);
  };
  const updateApprovalStatus = (id, newStatus) => {
    const updated = incidents.map((i) =>
      i.id === id
        ? {
            ...i,
            approvalStatus: newStatus,
            status:
              newStatus === "Approved"
                ? "Scheduled"
                : newStatus === "Rejected"
                ? "Cancelled"
                : i.status,
          }
        : i
    );
    setIncidents(updated);
    setIncidentsState(updated);
    setIncidents(updated);
  };
  

  const refreshIncidents = () => {
    const stored = getIncidents();
    const updated = stored.map((i) => ({
      ...i,
      approvalStatus: i.approvalStatus || "Pending",
    }));
    setIncidentsState(updated);
    setIncidents(updated);
  };

  const navigate = useNavigate();

  const revenue = incidents.reduce((sum, i) => sum + (i.cost || 0), 0);
  const pending = incidents.filter(
    (i) => i.status === "Scheduled" || i.status === "In Progress"
  ).length;
  const completed = incidents.filter((i) => i.status === "Completed").length;
  const cancelled = incidents.filter((i) => i.status === "Cancelled").length;

  const upcoming = incidents
    .filter((i) => new Date(i.appointmentDate) > new Date())
    .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
    .slice(0, 10);

  const recent = incidents
    .filter((i) => new Date(i.appointmentDate) <= new Date())
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))
    .slice(0, 10);

  const countMap = {};
  incidents.forEach((i) => {
    countMap[i.patientId] = (countMap[i.patientId] || 0) + 1;
  });
  const topPatients = patients
    .map((p) => ({ ...p, visits: countMap[p.id] || 0 }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  const getPatientName = (patientId) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient ? patient.name : "Unknown Patient";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Rescheduled":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
   
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Medical Dashboard
              </h1>
              <p className="text-gray-600">
                Admin Panel - Patient & Appointment Management
              </p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>

              <button
                onClick={() => {
                  navigate("/calendar");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
        <div className="mb-8">
          <nav className="flex space-x-8">
            {["overview", "patients", "appointments"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

   
        {activeTab === "overview" && (
          <div className="space-y-8">
       
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <KPICard
                title="Total Patients"
                value={patients.length}
                icon="👥"
                color="blue"
              />
              <KPICard
                title="Total Appointments"
                value={incidents.length}
                icon="📅"
                color="green"
              />
              <KPICard
                title="Revenue"
                value={`₹${revenue.toLocaleString()}`}
                icon="💰"
                color="yellow"
              />
              <KPICard
                title="Pending"
                value={pending}
                icon="⏳"
                color="orange"
              />
              <KPICard
                title="Completed"
                value={completed}
                icon="✅"
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Upcoming Appointments
                </h3>
                <div className="space-y-3">
                  {upcoming.length > 0 ? (
                    upcoming.map((incident) => (
                      <div
                        key={incident.id}
                        className="border-l-4 border-blue-500 pl-4 py-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {incident.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {getPatientName(incident.patientId)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {new Date(
                                incident.appointmentDate
                              ).toLocaleString()}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              incident.status
                            )}`}
                          >
                            {incident.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No upcoming appointments
                    </p>
                  )}
                </div>
              </div>

          
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">
                  Top Patients by Visits
                </h3>
                <div className="space-y-3">
                  {topPatients.map((patient, index) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : index === 1
                              ? "bg-gray-100 text-gray-800"
                              : index === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {patient.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {patient.contact}
                          </p>
                        </div>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {patient.visits} visits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

           
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Recent Appointments
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium text-gray-700">
                        Patient
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700">
                        Title
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700">
                        Cost
                      </th>
                      <th className="text-left py-2 font-medium text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((incident) => (
                      <tr
                        key={incident.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="py-3">
                          {getPatientName(incident.patientId)}
                        </td>
                        <td className="py-3">{incident.title}</td>
                        <td className="py-3">
                          {new Date(
                            incident.appointmentDate
                          ).toLocaleDateString()}
                        </td>
                        <td className="py-3">₹{incident.cost || 0}</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              incident.status
                            )}`}
                          >
                            {incident.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

    
        {activeTab === "patients" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Patient Management
              </h2>
              <button
                onClick={() => setEditing({})}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Add New Patient
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
                >
                  {editing?.id === patient.id ? (
                    <PatientForm
                      initial={patient}
                      onSave={savePatient}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {patient.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            DOB: {patient.dob}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {countMap[patient.id] || 0} visits
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <p className="text-sm">
                          <span className="font-medium">Contact:</span>{" "}
                          {patient.contact}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Health Info:</span>{" "}
                          {patient.healthInfo}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="space-x-2">
                          <button
                            onClick={() => setEditing(patient)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => removePatient(patient.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      
        {activeTab === "appointments" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Appointment Management
              </h2>
              <div className="space-x-4">
                <span className="text-sm text-gray-600">
                  Total: {incidents.length} | Pending: {pending} | Completed:{" "}
                  {completed}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Patient
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Title
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Date & Time
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Cost
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Treatment
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents
                      .sort(
                        (a, b) =>
                          new Date(b.appointmentDate) -
                          new Date(a.appointmentDate)
                      )
                      .map((incident) => (
                        <tr
                          key={incident.id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="py-3 px-4">
                            {getPatientName(incident.patientId)}
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{incident.title}</p>
                              <p className="text-sm text-gray-600 truncate max-w-xs">
                                {incident.description}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p>
                                {new Date(
                                  incident.appointmentDate
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(
                                  incident.appointmentDate
                                ).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                incident.status
                              )}`}
                            >
                              {incident.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">₹{incident.cost || 0}</td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">
                              {incident.treatment || "-"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {incident.approvalStatus === "Pending" ? (
                              <div className="flex gap-2">
                                <button
                                  className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600"
                                  onClick={() =>
                                    updateApprovalStatus(incident.id, "Approved")
                                  }
                                >
                                  Accept
                                </button>
                                <button
                                  className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600"
                                  onClick={() =>
                                    updateApprovalStatus(incident.id, "Rejected")
                                  }
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-600">
                                {incident.approvalStatus || "-"}
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => setEditingIncident(incident)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeIncident(incident.id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

    
      {editing && !editing.id && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PatientForm onSave={savePatient} onCancel={() => setEditing(null)} />
        </div>
      )}

      {addingIncidentFor && (
        <IncidentEditor
          patientId={addingIncidentFor}
          onClose={() => {
            setAddingIncidentFor(null);
            refreshIncidents();
          }}
        />
      )}

      {editingIncident && (
        <IncidentEditor
          patientId={editingIncident.patientId}
          editingIncident={editingIncident}
          onClose={() => {
            setEditingIncident(null);
            refreshIncidents();
          }}
        />
      )}
    </div>
  );
};

const KPICard = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    orange: "bg-orange-50 border-orange-200",
    red: "bg-red-50 border-red-200",
  };

  return (
    <div
      className={`${colorClasses[color]} border rounded-lg p-6 text-center hover:shadow-md transition-shadow`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-600 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
};

export default Dashboard;
