<div align="center">

# 🧠 BlueprintAI

### AI-Powered Software Planning Platform

*Turn a software idea into a complete set of engineering planning documents — instantly.*

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📌 What is BlueprintAI?

**BlueprintAI** is a full-stack SaaS platform designed for developers, students, and product teams who want to go from a raw software idea to a complete set of professional planning documents — without spending days writing them manually.

You describe your idea. BlueprintAI generates:

| Document | Description |
|---|---|
| 📄 **BRD** | Business Requirements Document |
| 📋 **SRS** | Software Requirements Specification |
| 🧑‍💼 **User Stories** | Agile-ready epics and stories |
| 🗄️ **DB Schema** | Entity-relationship model for your data |
| 🔌 **REST API Docs** | Endpoint definitions with request/response shapes |
| 🗓️ **Dev Roadmap** | Phased development milestones |

All documents live inside a **Project Workspace** — organized, editable, and exportable.

---

## 🚀 Current Status

> **Phase 1 — Authentication & Project Management** *(in development)*

The platform is being built in phases. Phase 1 delivers a fully working authentication system and project workspace skeleton, without any AI generation yet — a demoable slice on its own.

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Auth (register/login/logout) + Project CRUD | 🔨 In Progress |
| **Phase 2** | AI Document Generation (Gemini API) | ⏳ Planned |
| **Phase 3** | Document Editor + Rich-text rendering | ⏳ Planned |
| **Phase 4** | Export (PDF / Markdown) | ⏳ Planned |
| **Phase 5** | Collaboration & Sharing | ⏳ Planned |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Role |
|---|---|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **Tailwind CSS v3** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client (`withCredentials: true`) |
| **React Context API** | Global state management |

### Backend
| Technology | Role |
|---|---|
| **Node.js 18+** | Runtime |
| **Express.js** | Web framework |
| **Mongoose** | MongoDB ODM |
| **MongoDB Atlas** | Cloud database |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcryptjs** | Password hashing (cost factor 10) |
| **Zod** | Request body validation |
| **helmet** | Security headers |
| **express-rate-limit** | Brute-force protection on auth routes |
| **cookie-parser** | httpOnly cookie handling |

---

## 🏗️ Architecture

### Frontend — Strict 4-Layer Model

The frontend enforces a one-directional data flow with a hard separation of concerns:

```
UI (Presentation)
      ↓
Hooks (Orchestration)
      ↓
State (Memory)  ←→  API (Backend Communication)
```

| Layer | Files | Responsibility |
|---|---|---|
| **UI** | `pages/`, `components/` | Render screens, collect input, display loading/error states |
| **Hooks** | `hooks/useAuth.js`, `hooks/useProjects.js` | Orchestrate: call API, write to State, manage async transitions |
| **State** | `*.context.jsx` | Passive storage — holds `user`, `projects`, exposes setters only |
| **API** | `services/*.api.js` | Pure HTTP — axios calls, response normalization, nothing else |

> **Rule:** UI only talks to Hooks. Hooks talk to State and API. State and API never talk to each other or upward. No `axios` outside `services/`. No `try/catch` inside `*.context.jsx`.

---

## 📁 Project Structure

```
BlueprintAI/
├── backend/
│   ├── config/              # db.js — MongoDB Atlas connection
│   ├── controllers/         # authController.js, projectController.js
│   ├── middleware/          # authMiddleware, errorMiddleware, rateLimiter
│   ├── models/              # User.js, Project.js (Mongoose schemas)
│   ├── routes/              # authRoutes.js, projectRoutes.js
│   ├── schemas/             # Zod validation schemas
│   ├── utils/               # generateToken.js, asyncHandler.js
│   ├── app.js               # Express app factory
│   └── server.js            # Entry point
│
├── frontend/
│   └── src/
│       ├── features/
│       │   ├── auth/        # Login, Register — full 4-layer structure
│       │   └── projects/    # Dashboard, Detail, Create — full 4-layer structure
│       ├── components/      # Shared UI primitives (Button, Input, Spinner…)
│       ├── layouts/         # AuthLayout, DashboardLayout
│       ├── routes/          # ProtectedRoute.jsx, AppRouter.jsx
│       ├── lib/             # axiosInstance.js
│       └── utils/
│
├── PROJECT_SPEC.md          # Full technical specification
└── README.md                # This file
```

---

## 🔐 Security Design

- **JWT stored in httpOnly cookies** — never `localStorage`, never accessible via JavaScript
- Cookie flags: `httpOnly`, `secure` (in production), `sameSite: strict`
- **bcrypt** password hashing with cost factor 10 via Mongoose pre-save hook
- `password` field marked `select: false` — only explicitly selected during login
- **Zod** validation on every request body before it reaches a controller
- **helmet** security headers on all routes
- **Rate limiting** on `/api/auth/*` — 15 requests per 15 minutes per IP
- CORS locked to `CLIENT_URL` env variable with `credentials: true`
- Centralized error middleware — no raw stack traces leaked in production

---

## 🗄️ Data Models

### User
```js
{
  name:       String (required),
  email:      String (required, unique, lowercase),
  password:   String (required, select: false, bcrypt-hashed),
  role:       'user' | 'admin'  (default: 'user'),
  createdAt, updatedAt
}
```

### Project
```js
{
  title:       String (required),
  description: String (required),   // the raw idea text
  category:    String,
  techStack:   [String],
  owner:       ObjectId → User,     // ownership-enforced on every query
  createdAt, updatedAt
}
```

---

## 🔌 API Reference

### Auth Routes — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Create account, set JWT cookie |
| `POST` | `/login` | Public | Authenticate, set JWT cookie |
| `POST` | `/logout` | Private | Clear JWT cookie |
| `GET` | `/me` | Private | Return current user profile |

### Project Routes — `/api/projects`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/` | Private | Create a new project |
| `GET` | `/` | Private | List **only** the logged-in user's projects |
| `GET` | `/:id` | Private | Get one project (403/404 if not owner) |
| `PUT` | `/:id` | Private | Update project (ownership verified) |
| `DELETE` | `/:id` | Private | Delete project (ownership verified) |

> Ownership is enforced at the database query level: `{ _id: id, owner: req.user._id }` — not via separate middleware.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works fine)

### 1. Clone the repo
```bash
git clone https://github.com/your-username/blueprintai.git
cd blueprintai
```

### 2. Configure environment variables

**Backend** — create `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/blueprintai
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend** — create `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 4. Run the development servers

```bash
# Terminal 1 — Backend (runs on :5000)
cd backend
npm run dev

# Terminal 2 — Frontend (runs on :5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ✅ Phase 1 Definition of Done

- [x] User can register a new account
- [x] JWT is set as an httpOnly cookie (visible in DevTools → Application → Cookies, but invisible to `document.cookie`)
- [x] User can create a project with title / description / category / techStack
- [x] Dashboard shows only the logged-in user's own projects
- [x] Accessing another user's project by ID returns 403/404
- [x] User can edit and delete their own projects
- [x] Logout clears the cookie and redirects to `/login`
- [x] No console errors, no unhandled promise rejections
- [x] No layer violations
- [x] Fully responsive on mobile and desktop

---

## 👨‍💻 Author

**Akhil** — Final Year Engineering Project
> Built with ❤️ as a production-style MERN application

---

## 📄 License

This project is for academic and educational purposes.
