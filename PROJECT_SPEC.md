# BlueprintAI — Project Specification
**Phase 1: Authentication & Project Management**
*Version: 1.0 | Status: Draft*

---

## 1. Project Overview

BlueprintAI is a production-style MERN SaaS platform that converts a software idea into a full set of planning documents (BRD, SRS, user stories, DB schema, REST API docs, dev roadmap). This document covers Phase 1 only: the authentication system and project management skeleton.

**Phase 1 Goal:** A fully demoable slice where a user can register, log in, and create/view/edit/delete their own projects — with no AI generation yet.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite, Tailwind CSS v3, React Router v6, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT in httpOnly + secure + sameSite=strict cookie |
| Validation | Zod (backend), minimal client-side |
| Security | helmet, express-rate-limit, bcryptjs (cost 10) |

---

## 3. Frontend Architecture — 4-Layer Model

```
UI (Presentation) → Hooks (Orchestration) → State (Memory) → API (Backend Communication)
```

### Layer Contracts
| Layer | Files | Allowed to… | Never allowed to… |
|---|---|---|---|
| UI | `pages/`, `components/` | Call hook functions, render JSX, show loading/error from hook | Import axios, touch cookies/localStorage, contain business logic |
| Hooks | `hooks/useAuth.js`, `hooks/useProjects.js` | Call API layer, write to State, manage loading/error | Render JSX, hold data beyond transient values |
| State | `*.context.jsx` | Hold data (`user`, `projects`), expose setters | Call APIs, navigate, contain async/try-catch |
| API | `services/*.api.js` | Import axios instance, send HTTP, normalize responses | Import React, touch state or hooks |

> **Hard rule:** If a `*.context.jsx` contains `try/catch`, or a component imports axios — that's a layer violation that must be fixed immediately.

---

## 4. Folder Structure

```
frontend/
├── src/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/           # Login.jsx, Register.jsx
│   │   │   ├── components/      # LoginForm.jsx, RegisterForm.jsx
│   │   │   ├── hooks/           # useAuth.js
│   │   │   ├── auth.context.jsx
│   │   │   └── services/        # auth.api.js
│   │   └── projects/
│   │       ├── pages/           # Dashboard.jsx, ProjectDetail.jsx, CreateProject.jsx
│   │       ├── components/      # ProjectCard.jsx, ProjectForm.jsx
│   │       ├── hooks/           # useProjects.js
│   │       ├── projects.context.jsx
│   │       └── services/        # projects.api.js
│   ├── components/              # Shared dumb UI components (Button, Input, Spinner, etc.)
│   ├── layouts/                 # DashboardLayout.jsx, AuthLayout.jsx
│   ├── routes/                  # ProtectedRoute.jsx, AppRouter.jsx
│   ├── lib/                     # axiosInstance.js (baseURL, withCredentials, interceptors)
│   └── utils/                   # Shared utility helpers
backend/
├── config/                      # db.js — MongoDB Atlas connection
├── models/                      # User.js, Project.js
├── controllers/                 # authController.js, projectController.js
├── middleware/                  # authMiddleware.js, errorMiddleware.js, rateLimiter.js
├── routes/                      # authRoutes.js, projectRoutes.js
├── schemas/                     # authSchema.js, projectSchema.js (Zod)
├── utils/                       # generateToken.js, asyncHandler.js
├── app.js
└── server.js
```

---

## 5. Data Models

### User
```js
{
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true, lowercase: true },
  password:  { type: String, required: true, select: false },  // bcrypt, pre-save hook
  role:      { type: String, enum: ['user', 'admin'], default: 'user' },
  timestamps: true
}
```

### Project
```js
{
  title:       { type: String, required: true },
  description: { type: String, required: true },  // raw idea text
  category:    { type: String },
  techStack:   [{ type: String }],
  owner:       { type: ObjectId, ref: 'User', required: true },
  timestamps:  true
}
```

---

## 6. API Routes

| Method | Route | Access | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Zod-validated, returns user + sets cookie |
| POST | `/api/auth/login` | Public | Zod-validated, `.select('+password')`, sets cookie |
| POST | `/api/auth/logout` | Private | Clears cookie |
| GET | `/api/auth/me` | Private | Returns current user (no password) |
| POST | `/api/projects` | Private | Create project owned by `req.user._id` |
| GET | `/api/projects` | Private | Returns only `{ owner: req.user._id }` projects |
| GET | `/api/projects/:id` | Private | Query `{ _id: id, owner: req.user._id }` — 403/404 if not owner |
| PUT | `/api/projects/:id` | Private | Query `{ _id: id, owner: req.user._id }` before update |
| DELETE | `/api/projects/:id` | Private | Query `{ _id: id, owner: req.user._id }` before delete |

> Ownership checks live in the **controller**, not middleware. All private routes use `authMiddleware`.

---

## 7. Security Requirements

- **bcrypt** cost factor 10 via Mongoose pre-save hook
- **Zod** validation middleware on all request bodies before controllers are called
- **helmet** on all routes
- **express-rate-limit** scoped to `/api/auth/*` (15 requests / 15 minutes per IP)
- `password` field: `select: false` at schema level; only `login` uses `.select('+password')`
- Central error middleware: no raw stack traces in production (`NODE_ENV !== 'development'`)
- Cookie flags: `httpOnly: true`, `secure: true` in production, `sameSite: 'strict'`
- CORS: `credentials: true`, `origin` locked to `CLIENT_URL` env var

---

## 8. Environment Variables

### Backend `.env`
```
PORT=5000
MONGO_URI=<your-atlas-uri>
JWT_SECRET=<strong-random-secret>
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_API_BASE_URL=http://localhost:5000
```

---

## 9. Definition of Done — Phase 1

- [ ] User can register a new account
- [ ] User can log in; JWT is set as an httpOnly cookie (invisible to JS, visible only in DevTools → Application → Cookies)
- [ ] User can create a project with title / description / category / techStack
- [ ] Dashboard shows only the logged-in user's projects
- [ ] Accessing another user's project by ID returns 403/404 (not 200)
- [ ] User can edit and delete their own projects
- [ ] Logout clears the cookie and redirects to `/login`
- [ ] No console errors, no unhandled promise rejections
- [ ] No layer violations (axios outside `services/`, try-catch inside `*.context.jsx`, JSX from a hook)
- [ ] Fully responsive on mobile and desktop using Tailwind breakpoints

---

## 10. Out of Scope for Phase 1

- AI document generation (Gemini integration)
- Document editor / rich-text rendering
- Export features (PDF, Markdown download)
- Admin dashboard
- Collaboration / sharing features
- Email verification / password reset

---

## 11. Open Questions / Assumptions

1. **MongoDB Atlas URI** — connection string will be provided by you before running. The app fails gracefully (process exit) if the URI is missing.
2. **JWT expiry** — defaulting to 7 days for dev convenience. Confirm if a shorter window is needed.
3. **Tech stack array input** — on the frontend form, will treat it as a comma-separated string that gets split into an array on submit. Let me know if a tag-input component is preferred.
4. **Tailwind version** — using Tailwind CSS v3 (stable). Confirm if v4 is preferred.
5. **Design language** — I'll apply a dark-mode premium design (deep slate/indigo palette, glassmorphism cards, smooth transitions) consistent with an AI-SaaS product. Confirm or redirect if you have a brand direction.
