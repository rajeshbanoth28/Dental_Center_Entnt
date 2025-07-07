import { useState } from "react";
import {
  User,
  Calendar,
  Phone,
  FileText,
  Save,
  X,
  AlertCircle,
  Mail,
  Lock,
} from "lucide-react";

const PatientForm = ({ initial = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: initial.name || "",
    dob: initial.dob || "",
    contact: initial.contact || "",
    healthInfo: initial.healthInfo || "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [showCredentialModal, setShowCredentialModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const isEditMode = Boolean(initial.id); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
    if (name === "contact" && value && !/^\d+$/.test(value)) {
      setErrors({ ...errors, [name]: "Only numbers allowed" });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, form[name]);
  };

  const validateField = (name, value) => {
    const today = new Date().toISOString().split("T")[0];
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        else if (value.trim().length < 2)
          error = "Name must be at least 2 characters";
        break;
      case "dob":
        if (!value) error = "Date of birth is required";
        else if (value >= today) error = "Date must be before today";
        else {
          const age = calculateAge(value);
          if (age > 150) error = "Please enter a valid date of birth";
        }
        break;
      case "contact":
        if (!value) error = "Contact is required";
        else if (!/^\d{10}$/.test(value))
          error = "Contact must be exactly 10 digits";
        break;
      case "healthInfo":
        if (!value.trim()) error = "Health information is required";
        break;
    }

    if (error) setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    Object.keys(form).forEach((key) => validateField(key, form[key]));

    const hasErrors = Object.values(errors).some((e) => e);

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    if (isEditMode) {
      saveEditedPatient();
    } else {
      setShowCredentialModal(true);
    }
  };

  const saveEditedPatient = () => {
    const patients = JSON.parse(localStorage.getItem("patients") || "[]");
    const updatedPatients = patients.map((p) =>
      p.id === initial.id ? { ...p, ...form } : p
    );
    localStorage.setItem("patients", JSON.stringify(updatedPatients));
    setIsSubmitting(false);
    onSave?.({ id: initial.id, ...form });
  };

  const savePatientWithCredentials = () => {
    const patients = JSON.parse(localStorage.getItem("patients") || "[]");
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const alreadyExists = patients.find(
      (p) => p.name === form.name && p.dob === form.dob
    );
    if (alreadyExists) {
      alert("Patient already exists.");
      setIsSubmitting(false);
      setShowCredentialModal(false);
      return;
    }

    const newPatientId = `p${Date.now()}`;
    const newPatient = {
      id: newPatientId,
      name: form.name,
      dob: form.dob,
      contact: form.contact,
      healthInfo: form.healthInfo,
    };

    const newUser = {
      id: Date.now().toString(),
      role: "Patient",
      email: newEmail,
      password: newPassword,
      patientId: newPatientId,
    };

    try {
      const updatedPatients = [...patients, newPatient];
      const updatedUsers = [...users, newUser];

      localStorage.setItem("patients", JSON.stringify(updatedPatients));
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      setShowCredentialModal(false);
      setIsSubmitting(false);
      onSave?.(form); 
    } catch (e) {
      console.error("Failed to update localStorage", e);
      alert("Failed to save. Please try again.");
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    return Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const age = calculateAge(form.dob);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            {isEditMode ? "Edit Patient" : "New Patient Registration"}
          </h2>
        </div>

        <div className="p-4 space-y-4">
         
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name *
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.name && touched.name
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Enter full name"
            />
            {errors.name && touched.name && (
              <div className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </div>
            )}
          </div>

        
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Date of Birth *{" "}
              {age && <span className="text-gray-500 text-sm">(Age: {age})</span>}
            </label>
            <input
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              max={new Date().toISOString().split("T")[0]}
              required
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.dob && touched.dob
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
                }`
              }
            />
            {errors.dob && touched.dob && (
              <div className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.dob}
              </div>
            )}
          </div>

         
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Contact *
            </label>
            <input
              name="contact"
              type="tel"
              maxLength="10"
              value={form.contact}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.contact && touched.contact
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="10-digit number"
            />
            {errors.contact && touched.contact && (
              <div className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.contact}
              </div>
            )}
          </div>

       
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Health Info *
            </label>
            <textarea
              name="healthInfo"
              rows="2"
              value={form.healthInfo}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.healthInfo && touched.healthInfo
                  ? "border-red-500 bg-red-50"
                  : "border-gray-300"
              }`}
              placeholder="Allergies, conditions, etc."
            />
            {errors.healthInfo && touched.healthInfo && (
              <div className="text-red-600 text-sm flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.healthInfo}
              </div>
            )}
          </div>

       
          <div className="flex gap-3 pt-3 border-t border-gray-200">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex-1"
            >
              {isSubmitting ? "Saving..." : "Save Patient"}
            </button>
            <button
              onClick={onCancel}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

   
      {showCredentialModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Create Login Credentials
            </h3>
            <div className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  className="w-full pl-10 py-2 border rounded"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <input
                  type="password"
                  placeholder="Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 py-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowCredentialModal(false);
                    setIsSubmitting(false);
                  }}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={savePatientWithCredentials}
                  className="bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientForm;
