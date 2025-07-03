import { useState, useEffect } from "react";
import { getIncidents, setIncidents, getPatients } from "../utils/storage";

const IncidentEditor = ({
  patientId,
  onSave,
  onClose,
  editingIncident = null,
}) => {
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
    setFormData((prev) => ({ ...prev, [field]: value }));
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
    e.target.value = "";
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
      onSave?.();
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

  return null;
};

export default IncidentEditor;
