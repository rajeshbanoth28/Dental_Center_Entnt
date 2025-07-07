import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Calendar,
  Phone,
  FileText,
  Shield,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const SignupPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    dob: "",
    contact: "",
    healthInfo: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Check for empty fields
    for (const key in form) {
      if (!form[key]) {
        setError("Please fill in all fields.");
        return;
      }
    }

    if (!validateEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const patients = JSON.parse(localStorage.getItem("patients") || "[]");

    const emailExists = users.some((u) => u.email === form.email);
    if (emailExists) {
      setError("Email already registered.");
      return;
    }

    const patientId = uuidv4();
    const userId = uuidv4();

    const newPatient = {
      id: patientId,
      name: form.name,
      dob: form.dob,
      contact: form.contact,
      healthInfo: form.healthInfo,
    };

    const newUser = {
      id: userId,
      role: "Patient",
      email: form.email,
      password: form.password,
      patientId: patientId,
    };

    localStorage.setItem("patients", JSON.stringify([...patients, newPatient]));
    localStorage.setItem("users", JSON.stringify([...users, newUser]));

    setSuccess("Account created successfully! Redirecting to login...");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://t4.ftcdn.net/jpg/08/81/68/75/360_F_881687543_VKpcTw3Do5dpElnPlWzFWCCs7cY0NGcT.jpg')",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
          <p className="text-gray-600">Sign up as a Patient</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6"
        >
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {[
            { label: "Full Name ", name: "name", icon: <User /> },
            {
              label: "Date of Birth",
              name: "dob",
              type: "date",
              icon: <Calendar />,
            },
            { label: "Contact Number", name: "contact", icon: <Phone /> },
            { label: "Health Info", name: "healthInfo", icon: <FileText /> },
            { label: "Email Address", name: "email", icon: <Mail /> },
            {
              label: "Password",
              name: "password",
              type: "password",
              icon: <Lock />,
            },
          ].map(({ label, name, type = "text", icon }) => (
            <div key={name}>
              <label className=" text-sm font-medium flex gap-1 text-gray-700 mb-2">
                {label} <div className="text-red-500">*</div>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {icon}
                </div>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign Up
          </button>

          <div className="text-center pt-4 text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Log in here
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
