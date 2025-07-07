# 🦷 Dental Center Management – ENTNT Technical Assignment

This is a **frontend-only React application** for managing a dental center, developed as part of the ENTNT technical assignment for the **Frontend Developer** role.

---

##  Deployment

- **Live App:** [Add your deployed link here]
- **GitHub Repo:** [Add your GitHub link here]

---

##  Features

###  Authentication
- Hardcoded login for **Admin (Dentist)** and **Patient**
- Role-based dashboard access
- Session persisted in `localStorage`

### Patient Management (Admin-only)
- Add, edit, delete, and view patients
- Store contact, DOB, and health info

###  Appointment / Incident Management (Admin-only)
- Add multiple incidents per patient
- Includes cost, treatment, status, comments, next appointment, and file uploads

###  Calendar View
- Monthly/weekly view of all upcoming appointments

###  Dashboard
- KPIs like top patients, revenue, pending/completed treatments

###  Patient View
- Patients can view only their data, appointments, and treatments

---

##  Project Structure

```
src/
│
├── components/         # Reusable components
├── context/            # Auth & Global state (Context API)
├── pages/              # Page views (Login, Dashboard, etc.)
├── routes/             # Protected and public routes
├── utils/              # localStorage helpers, formatters
├── assets/             # Images, icons
└── App.jsx             # Root component with routes
```

---

##  Tech Stack

- **React (Functional Components)**
- **React Router**
- **Context API**
- **Tailwind CSS**
- **localStorage** for data persistence
- **File uploads** (base64 or Blob URLs)

---

##  Setup Instructions

1. Clone the repo  
   ```bash
   git clone https://github.com/your-username/dental-center-entnt.git
   cd dental-center-entnt
   ```

2. Install dependencies  
   ```bash
   npm install
   ```

3. Run the app locally  
   ```bash
   npm run dev   # or npm start (if using CRA)
   ```

---

##  Sample Credentials

```json
Admin:
  Email: admin@entnt.in
  Password: admin123

Patient:
  Email: john@entnt.in
  Password: patient123
```

---

##  Simulated Data

All data is stored in `localStorage`. JSON mock data includes users, patients, and incidents (appointments), with support for base64/Blob file uploads.

---

##  Technical Decisions

- Used **Context API** instead of Redux to keep things simple.
- **Tailwind CSS** chosen for fast, responsive UI development.
- Simulated **auth & data** using `localStorage` as backend is not allowed.

---

##  Known Issues

- No backend: data resets on clearing browser storage
- File uploads use base64, which can slow down large files

---

##  Submission

- Email the **GitHub repo** and **deployed link** to: `hr@entnt.in`
- Deadline: **Monday, 8 July**

---

##  Author

**Name:** Banoth Rajesh Nayak 
**Email:** rajeshrajnayak2003@gmail.com  
**LinkedIn:** https://www.linkedin.com/in/banoth-rajesh-nayak-4793bb273/
