import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { getPatients, getIncidents } from "../utils/storage";

const PatientView = () => {
  const { user, logout } = useAuth();
  const [patient, setPatient] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);

  useEffect(() => {
    const allPatients = getPatients();
    const thisPatient = allPatients.find((p) => p.id === user.patientId);
    setPatient(thisPatient);

    const myIncidents = getIncidents()
      .filter((i) => i.patientId === user.patientId)
      .sort(
        (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)
      );
    setIncidents(myIncidents);

    const future = myIncidents.find(
      (i) => new Date(i.appointmentDate) > new Date()
    );
    setNextAppointment(future || null);
  }, [user.patientId]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Welcome, {patient?.name}</h1>
        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      {nextAppointment && (
        <div className="bg-blue-50 p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">📅 Next Appointment</h2>
          <p>
            <strong>{nextAppointment.title}</strong>
          </p>
          <p>{new Date(nextAppointment.appointmentDate).toLocaleString()}</p>
          <p>Status: {nextAppointment.status}</p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Appointment History</h2>
        {incidents.length === 0 ? (
          <p>No incidents recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {incidents.map((i) => (
              <li
                key={i.id}
                className={`border rounded p-4 shadow ${
                  i.status === "Completed" ? "bg-green-50" : "bg-yellow-50"
                }`}
              >
                <p>
                  <strong>{i.title}</strong>
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(i.appointmentDate).toLocaleString()}
                </p>
                <p>
                  <span className="font-medium">Description:</span>{" "}
                  {i.description}
                </p>
                <p>
                  <span className="font-medium">Treatment:</span>{" "}
                  {i.treatment || "—"}
                </p>
                <p>
                  <span className="font-medium">Cost:</span> ₹{i.cost || 0}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {i.status}
                </p>
                {i.nextDate && (
                  <p>
                    <span className="font-medium">Next Visit:</span>{" "}
                    {i.nextDate}
                  </p>
                )}
                {i.files?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Attachments:</p>
                    <ul className="list-disc ml-5">
                      {i.files.map((f) => (
                        <li key={f.name}>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 underline"
                          >
                            {f.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PatientView;
