import { useState } from "react";

const PatientForm = ({ initial = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: initial.name || "",
    dob: initial.dob || "",
    contact: initial.contact || "",
    healthInfo: initial.healthInfo || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!form.name || !form.dob || !form.contact)
      return alert("All fields required");
    onSave({ ...initial, ...form });
  };

  return (
    <div className="p-4 border rounded bg-white shadow space-y-2">
      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
      />
      <input
        type="date"
        name="dob"
        value={form.dob}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
      />
      <input
        name="contact"
        placeholder="Contact Number"
        value={form.contact}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
      />
      <textarea
        name="healthInfo"
        placeholder="Health Info"
        value={form.healthInfo}
        onChange={handleChange}
        className="w-full border px-2 py-1 rounded"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Save
        </button>
        <button onClick={onCancel} className="bg-gray-400 px-3 py-1 rounded">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default PatientForm;
