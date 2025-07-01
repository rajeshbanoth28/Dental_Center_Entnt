import { useState } from "react";
import {
  User,
  Calendar,
  Phone,
  FileText,
  Save,
  X,
  AlertCircle,
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Real-time validation for contact
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
        else if (value >= today) error = "Date of birth must be before today";
        else {
          const birthDate = new Date(value);
          const age = Math.floor(
            (new Date() - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
          );
          if (age > 150) error = "Please enter a valid date of birth";
        }
        break;
      case "contact":
        if (!value) error = "Contact number is required";
        else if (!/^\d{10}$/.test(value))
          error = "Contact must be exactly 10 digits";
        break;
      case "healthInfo":
        if (!value.trim()) error = "Health information is required";
        break;
    }

    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Mark all fields as touched
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    Object.keys(form).forEach((key) => {
      validateField(key, form[key]);
    });

    // Check for existing errors
    const hasErrors =
      Object.values(errors).some((error) => error) ||
      Object.keys(form).some((key) => {
        validateField(key, form[key]);
        return errors[key];
      });

    if (hasErrors) {
      setIsSubmitting(false);
      return;
    }

    try {
      await onSave({ ...initial, ...form });
    } catch (error) {
      console.error("Save failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    const age = Math.floor(
      (today - birthDate) / (365.25 * 24 * 60 * 60 * 1000)
    );
    return age;
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const age = calculateAge(form.dob);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            {initial.name ? "Edit Patient" : "New Patient Registration"}
          </h2>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* Name Field */}
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Full Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter patient's full name"
              value={form.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 ${
                errors.name && touched.name
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            />
            {errors.name && touched.name && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.name}
              </div>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="space-y-1">
            <label
              htmlFor="dob"
              className="block text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Date of Birth *{" "}
              {age && (
                <span className="text-gray-500 font-normal">(Age: {age})</span>
              )}
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              onBlur={handleBlur}
              max={new Date().toISOString().split("T")[0]}
              className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 ${
                errors.dob && touched.dob
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            />
            {errors.dob && touched.dob && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.dob}
              </div>
            )}
          </div>

          {/* Contact Field */}
          <div className="space-y-1">
            <label
              htmlFor="contact"
              className="block text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              Contact Number *
            </label>
            <input
              id="contact"
              name="contact"
              type="tel"
              placeholder="Enter 10-digit phone number"
              value={form.contact}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength="10"
              className={`w-full px-3 py-2 border rounded-lg transition-all duration-200 ${
                errors.contact && touched.contact
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            />
            {form.contact && !errors.contact && form.contact.length === 10 && (
              <div className="text-green-600 text-sm">
                ✓ {formatPhoneNumber(form.contact)}
              </div>
            )}
            {errors.contact && touched.contact && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.contact}
              </div>
            )}
          </div>

          {/* Health Info Field */}
          <div className="space-y-2">
            <label
              htmlFor="healthInfo"
              className="block text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Health Information *
            </label>
            <textarea
              id="healthInfo"
              name="healthInfo"
              placeholder="Enter relevant health information, allergies, medications, etc."
              value={form.healthInfo}
              onChange={handleChange}
              onBlur={handleBlur}
              rows="2"
              maxLength="500"
              className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                errors.healthInfo && touched.healthInfo
                  ? "border-red-500 bg-red-50 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none`}
            />
            {errors.healthInfo && touched.healthInfo && (
              <div className="flex items-center gap-1 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                {errors.healthInfo}
              </div>
            )}
            <div className="text-right text-xs text-gray-500">
              {form.healthInfo.length}/500 characters
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Patient
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientForm;
