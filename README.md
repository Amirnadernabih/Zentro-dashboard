# 🚀 **Business Dashboard (React + Firebase + Vercel)**

A **secure, responsive, and modern dashboard** for managing **Sales, Expenses, and Summaries**.
Built with **React, Firebase Authentication, Firestore, and Material UI (MUI)** — and deployed seamlessly on **Vercel**.

---

## ✨ **Features**

* 🔐 **Authentication**

  * Login with email + password (Firebase Auth)
  * Guest mode with local-only demo data (safe & private)
  * Session-only tokens (no persistent cookies)

* 📊 **Dashboard Modules**

  * **Summary Page** → consolidated view of Sales & Expenses
  * **Sales Page** → add, edit, delete, and view sales records
  * **Expenses Page** → add, edit, delete, and view expense records

* 🛡️ **Security by Design**

  * Prevents XSS, CSRF, and common [OWASP Top 10](https://owasp.org/Top10/) risks
  * Rate-limiting on login attempts (anti brute-force)
  * Sanitized + validated inputs

* 🎨 **UI / UX**

  * Built with [Material UI](https://mui.com/) for a professional look
  * Fully responsive (mobile-first)
  * Dark-themed navbar with gold accents for a premium feel

---

## 🖥️ **Tech Stack**

* **Frontend:** React 18 + React Router
* **UI Library:** Material UI (MUI v5)
* **Backend:** Firebase (Auth + Firestore)
* **Deployment:** Vercel
* **Auth Persistence:** Session-only

---

## ⚡ **Getting Started**

### 🔹 **1. Clone the Repository**

```bash
git clone https://github.com/Amirnadernabih/Zentro-dashboard.git
cd Zentro-dashboard
```

### 🔹 **2. Install Dependencies**

```bash
npm install
```

### 🔹 **3. Configure Environment**

Create a file named `.env.local` in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 🔹 **4. Run Locally**

```bash
npm run dev
```

➡️ **App runs on:** [http://localhost:5173](http://localhost:5173)
