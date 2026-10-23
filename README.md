# CampusConnect - College Event & Club Management System

> **ICTAK MERN Stack Capstone Project**  
> Built with MongoDB, Express.js, React (Vite), and Node.js.

---

## 1. Project Overview & Problem Statement

### Problem Statement
College campuses host dozens of academic workshops, club activities, and cultural fests every semester. Traditional registration methods rely on fragmented Google Forms and manual spreadsheets, leading to duplicate registrations, venue overbooking, lack of real-time seat availability, and untracked student attendance.

### Solution
**CampusConnect** is a centralized, role-based College Event and Club Management web application. It enables students to discover verified events and secure seats with atomic capacity limits, provides organizers with participant rosters and attendance management tools, and offers administrators comprehensive platform analytics and governance controls.

### Target Users & Roles
1. **Student:** Browse published events, filter by category and upcoming dates, register with one click, prevent duplicate registrations, view personalized schedule, and cancel active registrations.
2. **Organizer:** Create and manage owned events, edit event details, track participant counts, view registered student rosters, and record verified on-site attendance.
3. **Admin:** Platform oversight, real-time analytics (registrations, category breakdowns, attendance rates), user management (role elevation / status toggle with self-lockout protection), and event moderation.

---

## 2. Minimum Viable Product (MVP) vs. Future Scope

### MVP Core Deliverables (Implemented & Tested)
- [x] Secure JWT-based Authentication with bcrypt password hashing.
- [x] Three discrete roles: `student`, `organizer`, `admin`.
- [x] Public event catalog with search, category filtering, and upcoming event filters.
- [x] Event detail views with dynamic seat counter and capacity progress indicator.
- [x] Student registration workflow with database-level duplicate prevention (`{ student: 1, event: 1 }` unique index).
- [x] Seat capacity validation preventing overbooking.
- [x] Student dashboard with upcoming registrations and attendance history.
- [x] Organizer dashboard for event creation, editing, cancellation, and participant rosters.
- [x] On-site student attendance tracking (Present / Absent) by organizers.
- [x] Admin console with platform statistics, user management, and event moderation.
- [x] Responsive modern UI with loading spinners, empty states, and error/success alerts.
- [x] Centralized error handling without leaking server internals or credentials.

### Future Roadmap (Post-MVP)
- QR-code based ticket scanning at venue entrance.
- Automated email / SMS calendar reminders.
- Certificate of participation generation for attendees.
- Event feedback and rating forms.

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | `^18.3.1` | Declarative component-based UI |
| **Build Tool** | Vite | `^5.2.11` | Fast HMR development and optimized production builds |
| **Routing** | React Router DOM | `^6.23.1` | Client-side routing and protected routes |
| **Backend** | Node.js & Express.js | `v24+` / `^4.19.2` | RESTful API server and route handling |
| **Database** | MongoDB & Mongoose | `^8.3.1` | Document persistence, schemas, and indexing |
| **Authentication**| JSON Web Tokens (JWT) & bcryptjs | `^9.0.2` / `^2.4.3` | Stateless token auth and salted password hashing |
| **Styling** | Modern CSS Variables | Plain CSS | Responsive design, accessible UI, no bloated dependencies |

---

## 4. Project Structure

Following the **ICTAK separation of concerns** architecture:

```text
CampusConnect/
├── client/                     # React Frontend (Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI pieces (Navbar, Footer, EventCard, Alert, etc.)
│   │   ├── context/            # AuthContext (state, login, token management)
│   │   ├── pages/              # Route screens (Home, Events, Details, Login, Register, Dashboards)
│   │   ├── services/           # Centralized API client (HTTP fetch client)
│   │   ├── App.jsx             # Route definitions & layout wrappers
│   │   ├── index.css           # Design tokens, responsive utilities & component styling
│   │   └── main.jsx            # React root mount
│   ├── .env.example            # Frontend environment variable template
│   ├── index.html              # HTML shell
│   ├── package.json            # Client dependencies and scripts
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Node.js & Express REST API
│   ├── src/
│   │   ├── config/             # Database connection (db.js)
│   │   ├── controllers/        # Request handling and business logic
│   │   │   ├── authController.js
│   │   │   ├── eventController.js
│   │   │   ├── registrationController.js
│   │   │   └── adminController.js
│   │   ├── middleware/         # Auth verification, role checks, and error handling
│   │   │   ├── auth.js
│   │   │   └── error.js
│   │   ├── models/             # Mongoose schemas & constraints
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   └── Registration.js
│   │   ├── routes/             # REST route mapping
│   │   ├── utils/              # Token generation and database seeder
│   │   ├── app.js              # Express app configuration & middleware
│   │   └── server.js           # Server bootstrap and port listener
│   ├── tests/                  # Automated backend and security tests
│   ├── .env.example            # Server environment variable template
│   └── package.json            # Server dependencies and scripts
│
├── .gitignore                  # Git ignore rules for node_modules, .env, dist
├── package.json                # Monorepo convenience scripts
└── README.md                   # Full documentation & project guide
```

---

## 5. Database Design & Schemas

### 1. `User` Model
- `name` (String, required, min 2, max 50)
- `email` (String, required, unique index, lowercase, trimmed)
- `password` (String, required, hashed with bcrypt, excluded by default)
- `role` (String, enum: `['student', 'organizer', 'admin']`, default: `'student'`)
- `department` (String, optional)
- `studentId` (String, optional)
- `isActive` (Boolean, default: `true`)
- `timestamps` (`createdAt`, `updatedAt`)

### 2. `Event` Model
- `title` (String, required, min 3, max 120)
- `description` (String, required, min 10)
- `category` (String, enum: `['Technical', 'Cultural', 'Sports', 'Workshop', 'Seminar', 'Club Activity', 'Other']`)
- `date` (Date, required)
- `time` (String, required, e.g., "10:00 AM - 01:00 PM")
- `venue` (String, required)
- `capacity` (Number, required, min 1)
- `registeredCount` (Number, default 0)
- `organizer` (ObjectId, ref: `User`, required)
- `status` (String, enum: `['draft', 'published', 'cancelled']`, default: `'published'`)
- `isApproved` (Boolean, default `true`)
- **Indexes:** `{ date: 1, category: 1, status: 1 }`, `{ organizer: 1 }`

### 3. `Registration` Model
- `student` (ObjectId, ref: `User`, required)
- `event` (ObjectId, ref: `Event`, required)
- `status` (String, enum: `['registered', 'cancelled']`, default: `'registered'`)
- `attended` (Boolean, default: `false`)
- `registeredAt` (Date, default: `Date.now`)
- **Compound Unique Index:** `{ student: 1, event: 1 }` prevents duplicate student entries.

---

## 6. REST API Contract

### Authentication (`/api/auth`)
| Method | Endpoint | Purpose | Request Body | Success | Error Codes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register student / organizer | `{ name, email, password, role, department, studentId }` | `201 Created` | `400, 409` |
| `POST` | `/api/auth/login` | Authenticate & get JWT | `{ email, password }` | `200 OK` (token + user) | `400, 401, 403` |
| `GET` | `/api/auth/me` | Fetch active session profile | *Bearer Token* | `200 OK` | `401` |
| `PUT` | `/api/auth/profile` | Update profile information | `{ name, department, studentId }` | `200 OK` | `401` |

### Events (`/api/events`)
| Method | Endpoint | Purpose | Query / Body | Access | Success | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Browse published events | `?search=&category=&upcoming=&page=` | Public | `200 OK` | `500` |
| `GET` | `/api/events/:id` | Event details + seat info | None | Public | `200 OK` | `404` |
| `POST` | `/api/events` | Create new event | `{ title, description, category, date, time, venue, capacity }` | Organizer, Admin | `201 Created` | `400, 401, 403` |
| `GET` | `/api/events/organizer/my-events` | List events by organizer | None | Organizer, Admin | `200 OK` | `401, 403` |
| `PUT` | `/api/events/:id` | Update event details | Event update payload | Organizer (Owner), Admin | `200 OK` | `400, 403, 404` |
| `PATCH` | `/api/events/:id/cancel` | Cancel an event | None | Organizer (Owner), Admin | `200 OK` | `403, 404` |

### Registrations (`/api/registrations`)
| Method | Endpoint | Purpose | Access | Success | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/registrations/:eventId` | Register for event seat | Student | `201 Created` | `400 (Full/Past), 409 (Duplicate)` |
| `PATCH` | `/api/registrations/:id/cancel`| Cancel active registration | Student (Owner), Admin | `200 OK` | `400, 403, 404` |
| `GET` | `/api/registrations/my-registrations` | Student registrations list | Student | `200 OK` | `401, 403` |
| `GET` | `/api/registrations/events/:eventId/participants` | View event roster | Organizer (Owner), Admin | `200 OK` | `403, 404` |
| `PATCH` | `/api/registrations/:id/attendance` | Record attendance | Organizer (Owner), Admin | `200 OK` | `400, 403, 404` |

### Admin Oversight (`/api/admin`)
| Method | Endpoint | Purpose | Access | Success | Errors |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats` | Real platform metrics | Admin | `200 OK` | `401, 403` |
| `GET` | `/api/admin/users` | List / search all users | Admin | `200 OK` | `401, 403` |
| `PATCH` | `/api/admin/users/:userId/role` | Promote/demote role | Admin | `200 OK` | `400 (Self-lock), 404` |
| `PATCH` | `/api/admin/users/:userId/status`| Activate/deactivate user | Admin | `200 OK` | `400 (Self-lock), 404` |
| `GET` | `/api/admin/events` | Oversee all campus events | Admin | `200 OK` | `401, 403` |
| `PATCH` | `/api/admin/events/:eventId/moderate` | Moderate/approve event | Admin | `200 OK` | `404` |

---

## 7. Installation & Local Startup

### Prerequisites
- **Node.js** (v18 or higher; tested on Node v24)
- **npm** (v9 or higher)
- **MongoDB** (Local MongoDB Community Server running on `27017` or a MongoDB Atlas cluster URI)

### Quick Start (Two Terminals)

#### Terminal 1: Backend Server
```bash
cd server
npm install
npm run test           # Run automated security and validation unit tests
npm run dev            # Starts API on http://localhost:5000
```

#### Terminal 2: React Frontend
```bash
cd client
npm install
npm run dev            # Starts Vite dev server on http://localhost:5173
```

Visit **`http://localhost:5173`** in your browser.

---

## 8. Environment Variables & Database Setup

### Server Configuration (`server/.env`)
Create `server/.env` (a template is available in `server/.env.example`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/campusconnect
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Initial Admin Seed Credentials
ADMIN_NAME=Campus Admin
ADMIN_EMAIL=admin@campusconnect.edu
ADMIN_PASSWORD=AdminSecure123!
```

### Client Configuration (`client/.env`)
Create `client/.env` (a template is available in `client/.env.example`):
```env
VITE_API_URL=http://localhost:5000/api
```

### Seeding Demo Data (Admin, Organizer, Student, Events)
To populate initial sample data for demonstration:
```bash
cd server
npm run seed
```
Demo accounts created:
- **Admin:** `admin@campusconnect.edu` / `AdminSecure123!`
- **Organizer:** `organizer@campusconnect.edu` / `OrganizerSecure123!`
- **Student:** `student@campusconnect.edu` / `StudentSecure123!`

---

## 9. Verification & Automated Test Results

The backend contains a standalone automated test suite (`server/tests/run-tests.js`).

### Test Execution Output
```text
======================================================
 CAMPUSCONNECT BACKEND AUTOMATED UNIT & SECURITY TESTS
======================================================

--- 1. Token Utilities & Cryptography ---
  ✓ PASS: generateToken generates valid JWT with payload
  ✓ PASS: Password hashing produces secure salted bcrypt hash

--- 2. Role-Based Authorization Middleware ---
  ✓ PASS: authorize middleware blocks unauthorized roles with 403
  ✓ PASS: authorize middleware permits authorized roles to proceed

--- 3. Authentication & Header Protection ---
  ✓ PASS: protect middleware rejects requests without Authorization header (401)

--- 4. Centralized Error Handler ---
  ✓ PASS: errorHandler handles Mongoose duplicate key error (code 11000) with 409 Conflict
  ✓ PASS: errorHandler handles Mongoose CastError with 400 Bad Request

--- 5. Business Logic & Constraints ---
  ✓ PASS: Public registration cannot arbitrarily assign "admin" role
  ✓ PASS: Capacity limit logic prevents overbooking
  ✓ PASS: Admin self-demotion prevention triggers correctly

======================================================
 Summary: 10 passed, 0 failed.
======================================================
```

### Frontend Build Verification
```text
vite v5.4.21 building for production...
✓ 53 modules transformed.
dist/index.html                   1.19 kB
dist/assets/index-BiUihQ4g.css    6.45 kB
dist/assets/index-BWyMS38W.js   247.25 kB
✓ built in 1.74s
```

---

## 10. Deployment Guide (ICTAK Standards)

### 1. Database (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write permissions.
3. Whitelist network IP addresses (`0.0.0.0/0` for cloud deployment).
4. Copy the connection string to the server environment variable `MONGODB_URI`.

### 2. Backend (Render / Railway)
1. Deploy `server/` as a Web Service.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Configure environment variables (`PORT`, `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL=<your-frontend-domain>`).

### 3. Frontend (Vercel / Netlify)
1. Deploy `client/` as a static site.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Set environment variable: `VITE_API_URL=https://<your-backend-api>/api`
5. Configure SPA rewrite rule (redirect all `/*` to `/index.html` so client-side routing functions on page refresh).

---

## 11. Final Submission Checklist (ICTAK Guide Section 13)

- [x] **Repository Initialized:** Clean Git repository with `.gitignore` excluding `node_modules/`, `.env`, and `dist/`.
- [x] **No Secrets Committed:** No passwords, database URIs, or JWT secrets stored in version control; `.env.example` provided for both client and server.
- [x] **Separation of Concerns:** Clear boundary between React client and Express API; React never interacts directly with MongoDB.
- [x] **Role-Based Security:** Server-side authorization middleware protecting Student, Organizer, and Admin actions.
- [x] **Input Validation & Safe Errors:** Server validates inputs and returns friendly error messages without stack traces.
- [x] **State Management & UI Polish:** Controlled forms, loading indicators, empty states, error banners, and modal confirmations.
- [x] **Testing Evidence:** 10/10 automated tests passing; production Vite build passing with 0 errors.
