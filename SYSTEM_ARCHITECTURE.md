# 🎓 University Clearance Management System
## System Architecture & Technical Manual

This document provides a comprehensive overview of the system's architecture, workflows, file structure, and configuration.

---

## 🚀 1. Technology Stack
The system is built using a modern **Three-Tier Architecture** with high-interoperability:

*   **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI, Lucide Icons, Recharts (Analytics).
*   **Backend**: Node.js, Express.js, Socket.IO (Real-time updates), JWT (Security).
*   **Database**: Supabase (PostgreSQL) with Row-Level Security (RLS) and real-time listeners.
*   **Automation**: Google Apps Script (Workspace Integration, Admin SDK, Gmail API).

---

## 🔄 2. Core Workflows

### A. Authentication Workflow
1.  User enters credentials on the Frontend.
2.  Backend `auth.routes.js` verifies identity via Supabase.
3.  JWT Token is generated with user role (Admin, Student, Staff).
4.  Frontend stores token and redirects to the role-specific dashboard.

### B. Clearance Request Workflow
1.  **Student**: Hits "Initiate Clearance" on `StudentDashboard.tsx`.
2.  **Backend**: `clearance.routes.js` creates a master request and generates `N` sub-requests for every active department.
3.  **Real-time**: Socket.IO notifies relevant Department Staff instantly.
4.  **Department**: Staff reviews the request in `DepartmentDashboard.tsx`, adds remarks/dues, and clicks Approve/Reject.
5.  **Automation**: Google Apps Script sends an email to the student notifying them of the update.
6.  **Finalization**: Once all departments approve, the Admin can issue the final Certificate.

---

## 📂 3. File Structure & Logic Map

### 💻 Frontend (`/frontend/src`)
| File | Logic / Responsibility |
| :--- | :--- |
| `main.tsx` | Entry point. Wraps the app in `ErrorBoundary` and `StrictMode`. |
| `App.tsx` | Main Router and State Manager. Handles user session and tab navigation. |
| `components/AdminDashboard.tsx` | Central analytics, user management, and department overview. |
| `components/StudentDashboard.tsx` | Personal clearance tracker, real-time progress bar, and contact UI. |
| `components/DepartmentDashboard.tsx` | Pending request queue, student management, and dues tracking for staff. |
| `components/ErrorBoundary.tsx` | **Safety Net**: Prevents app crashes if data is missing or API fails. |
| `lib/api.ts` | Axios instance with Interceptors to handle JWT tokens automatically. |

### ⚙️ Backend (`/backend`)
| File | Logic / Responsibility |
| :--- | :--- |
| `server.js` | Main Express server. Configures Helmet (Security), CORS, Rate-Limiting, and Socket.IO. |
| `middleware/auth.middleware.js` | **RBAC (Security)**: Enforces permissions (e.g., only Admin can see Admin routes). |
| `middleware/error.middleware.js` | **Robustness**: Translates Supabase/Postgres errors into safe client messages. |
| `services/appsScript.service.js` | Handles outgoing communication to the Google Apps Script Web App. |
| `routes/` | Each file (admin, student, auth) handles specific API endpoints. |

---

## 🔑 4. Environment Configuration (`.env`)

### Backend `.env`
*   `PORT`: Port for the server (default: 5000).
*   `SUPABASE_URL` / `SUPABASE_KEY`: Connection to your database.
*   `JWT_SECRET`: Secret key for signing login tokens (Keep this private!).
*   `APPS_SCRIPT_URL`: The **Web App URL** from your Google Apps Script deployment.
*   `FRONTEND_URL`: Usually `http://localhost:5173` in development.

### Frontend `.env`
*   `VITE_API_URL`: Points to the backend (e.g., `http://localhost:5000/api`).
*   `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: Direct Supabase access for public assets.

---

## 🛡️ 5. Security Measures
1.  **Rate Limiting**: Prevents brute-force attacks on the Login API.
2.  **Helmet.js**: Implements Content Security Policy (CSP) and hides server details.
3.  **Optional Chaining**: Used across the frontend to handle `null` database values safely.
4.  **Input Sanitation**: All inputs are sanitized before being sent to the database.
5.  **Audit Logs**: Every clearance approval/rejection is logged with a timestamp and staff ID.

---
*Documentation Version 1.0 | University IT Department*
