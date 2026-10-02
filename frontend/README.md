# 🎀 Pink Expense Tracker App

A full-stack, responsive web application for managing personal expenses with a soft pastel aesthetic interface. Built with **Node.js, Express.js, HTML5, Bootstrap 5, and Vanilla JavaScript (Fetch API)**.

---

## ✨ Key Features

- **📊 Dynamic Summary Dashboard**: Displays Real-time Total Amount, Total Expense Count, and Highest Expense.
- **⚡ Full CRUD Functionality**:
  - **Create**: Add new expenses with validation (title, amount, category, date).
  - **Read**: Fetch and display all saved expenses dynamically.
  - **Update**: Edit existing expense details via a Bootstrap Modal with `PUT` request.
  - **Delete**: Remove expenses with immediate local and server updates.
- **🔍 Advanced Filtering & Search**:
  - Live search by expense title.
  - Filter expenses by category (*Food*, *Transport*, *Bills*, *Entertainment*, *Other*).
- **↕️ Sorting Options**: Sort expenses by Date (Newest / Oldest) or Amount (High to Low / Low to High).
- **📥 Data Export**: Export and download all recorded expenses as a `.csv` file.
- **💖 Interactive UI & UX**:
  - Loading spinner for asynchronous fetch requests.
  - Custom Bootstrap alerts for error handling and success feedback.
  - Fully responsive pastel pink theme tailored for a delightful user experience.

---

## 🛠️ Project Structure

```text
expense-tracker/
│
├── backend/
│   ├── data/
│   │   └── expenses.json      # File-based Database
│   ├── server.js              # Express REST API Server
│   └── package.json           # Backend Dependencies
│
├── frontend/
│   ├── css/
│   │   └── style.css          # Custom Pastel Theme & Styling
│   ├── js/
│   │   └── app.js             # Client-side Logic & Fetch Requests
│   └── index.html             # Main Web Interface
│
└── README.md                  # Project Documentation