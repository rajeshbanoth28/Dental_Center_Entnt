import { useState, useEffect } from "react";
import { getIncidents, setIncidents, getPatients } from "../utils/storage";

const IncidentEditor = ({ patientId, onClose, editingIncident = null }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    comments: "",
    appointmentDate: "",
    cost: 0,
    treatment: "",
    status: "Scheduled",
    nextDate: "",
    files: [],
  });
  const [newFiles, setNewFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    setPatients(getPatients());

    if (editingIncident) {
      setFormData({
        title: editingIncident.title || "",
        description: editingIncident.description || "",
        comments: editingIncident.comments || "",
        appointmentDate: editingIncident.appointmentDate || "",
        cost: editingIncident.cost || 0,
        treatment: editingIncident.treatment || "",
        status: editingIncident.status || "Scheduled",
        nextDate: editingIncident.nextDate || "",
        files: editingIncident.files || [],
      });
    }
  }, [editingIncident]);

  const isEditing = !!editingIncident;
  const isPostAppointment =
    formData.appointmentDate && new Date(formData.appointmentDate) < new Date();
  const selectedPatient = patients.find((p) => p.id === patientId);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileUpload = async (fileList) => {
    setIsLoading(true);
    const uploadedFiles = [];

    for (let file of fileList) {
      try {
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve({
              id: `file_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`,
              name: file.name,
              url: reader.result,
              type: file.type,
              size: file.size,
              uploadDate: new Date().toISOString(),
            });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        uploadedFiles.push(fileData);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    setNewFiles((prev) => [...prev, ...uploadedFiles]);
    setIsLoading(false);
  };

  const handleFileChange = async (e) => {
    const fileList = Array.from(e.target.files);
    if (fileList.length > 0) {
      await handleFileUpload(fileList);
    }
    e.target.value = ""; // Reset input
  };

  const removeFile = (fileId, isNewFile = true) => {
    if (isNewFile) {
      setNewFiles((prev) => prev.filter((f) => f.id !== fileId));
    } else {
      setFormData((prev) => ({
        ...prev,
        files: prev.files.filter((f) => f.id !== fileId),
      }));
    }
  };

  const downloadFile = (file) => {
    const link = document.createElement("a");
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const allFiles = [...formData.files, ...newFiles];

      const incidentData = {
        id: editingIncident?.id || `i${Date.now()}`,
        patientId,
        title: formData.title,
        description: formData.description,
        comments: formData.comments,
        appointmentDate: formData.appointmentDate,
        cost: Number(formData.cost),
        treatment: formData.treatment,
        status: formData.status,
        nextDate: formData.nextDate,
        files: allFiles,
        createdAt: editingIncident?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const incidents = getIncidents();
      let updated;

      if (isEditing) {
        updated = incidents.map((incident) =>
          incident.id === editingIncident.id ? incidentData : incident
        );
      } else {
        updated = [...incidents, incidentData];
      }

      setIncidents(updated);
      onClose();
    } catch (error) {
      console.error("Error saving incident:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    formData.description.trim() &&
    formData.appointmentDate;

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type.includes("pdf")) return "📄";
    if (type.includes("word") || type.includes("doc")) return "📝";
    if (type.includes("excel") || type.includes("sheet")) return "📊";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? "Edit Appointment" : "New Appointment"}
                </h2>
                <p className="text-blue-100 mt-1">
                  Patient: {selectedPatient?.name || "Unknown"}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                📋 Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Regular Checkup, Surgery, Consultation"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Appointment Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.appointmentDate}
                    onChange={(e) =>
                      handleInputChange("appointmentDate", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  placeholder="Detailed description of the appointment purpose, symptoms, or concerns"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Comments
                </label>
                <textarea
                  placeholder="Any additional notes, special instructions, or observations"
                  value={formData.comments}
                  onChange={(e) =>
                    handleInputChange("comments", e.target.value)
                  }
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Post-Appointment Details */}
            {(isPostAppointment ||
              isEditing ||
              formData.status !== "Scheduled") && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                  🏥 Post-Appointment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Rescheduled">Rescheduled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost (₹)
                    </label>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={formData.cost}
                      onChange={(e) =>
                        handleInputChange("cost", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Next Appointment Date
                    </label>
                    <input
                      type="date"
                      value={formData.nextDate}
                      onChange={(e) =>
                        handleInputChange("nextDate", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment Provided
                  </label>
                  <textarea
                    placeholder="Details of treatment, medications prescribed, procedures performed, etc."
                    value={formData.treatment}
                    onChange={(e) =>
                      handleInputChange("treatment", e.target.value)
                    }
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* File Upload Section */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                📎 Files & Documents
              </h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF, DOC, DOCX, JPG, PNG, TXT (MAX. 10MB each)
                      </p>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.xls,.xlsx"
                      className="hidden"
                      disabled={isLoading}
                    />
                  </label>
                </div>
              </div>

              {/* Display uploaded files */}
              {(formData.files.length > 0 || newFiles.length > 0) && (
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Uploaded Files:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Existing files */}
                    {formData.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="text-2xl">
                            {getFileIcon(file.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(file.size)} •{" "}
                              {new Date(file.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            type="button"
                            onClick={() => downloadFile(file)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id, false)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* New files */}
                    {newFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <span className="text-2xl">
                            {getFileIcon(file.type)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                New
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <button
                            type="button"
                            onClick={() => downloadFile(file)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFile(file.id, true)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-sm text-gray-600">
                    Uploading files...
                  </span>
                </div>
              )}
            </div>

            {/* Summary Section */}
            {isEditing && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  📊 Appointment Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Created</p>
                    <p className="font-medium">
                      {new Date(editingIncident.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Last Updated</p>
                    <p className="font-medium">
                      {new Date(
                        editingIncident.updatedAt || editingIncident.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Files</p>
                    <p className="font-medium">
                      {formData.files.length + newFiles.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        formData.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : formData.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : formData.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {!isFormValid && (
                  <span className="text-red-600">
                    * Please fill in all required fields
                  </span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className={`px-6 py-2 text-white rounded-lg transition-colors flex items-center ${
                    isFormValid && !isLoading
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  )}
                  {isLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update Appointment"
                    : "Create Appointment"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncidentEditor;
