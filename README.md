<div align="center">

# 🧠 BlueprintAI

### Autonomous Software Planning & Engineering Blueprint Generation Platform

*Transform raw software concepts into structured, interconnected, production-ready engineering specifications.*

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.2-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?style=for-the-badge&logo=pinecone&logoColor=white)](https://www.pinecone.io)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.6_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📌 Overview

**BlueprintAI** is a centralized software architecture and planning platform that converts user concepts and requirement documents into tightly coupled, industry-standard engineering deliverables. 

Traditional AI chat sessions quickly degrade due to context window limits and lack of cross-document synchronization. BlueprintAI solves this by orchestrating a sequential **Multi-LLM Pipeline** paired with **Retrieval-Augmented Generation (RAG)**, structured data validation, versioned snapshots, and an interactive workspace.

```
                    ┌─────────────────────────┐
                    │ Raw Idea / File Uploads │
                    │   (TXT, PDF, DOCX)      │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │ AI Requirement Analysis │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
  │     BRD     │ ──────► │     SRS     │ ──────► │User Stories │
  └─────────────┘         └──────┬──────┘         └─────────────┘
                                 │
                     ┌───────────┴───────────┐
                     ▼                       ▼
              ┌─────────────┐         ┌─────────────┐
              │  DB Schema  │         │  REST APIs  │
              │(Visual ERD) │         │ (OpenAPI)   │
              └─────────────┘         └─────────────┘
                                 │
                                 ▼
              ┌─────────────────────────────────────┐
              │   Interactive Workspace & Studio    │
              │  • Prose Editor  • React Flow ERD   │
              │  • Section Regen • AI Refinements   │
              │  • Version Diffs • PDF & MD Export  │
              └─────────────────────────────────────┘
```

---

## ✨ Key Capabilities

* 🔄 **Multi-LLM Provider Engine with Auto-Fallback**:
  Intelligent orchestration across **Google Gemini**, **Groq**, and **OpenRouter**. If rate limits (429) or service degradation (503) occur, the engine fails over automatically to the next available provider in your configured chain without failing the generation job.
* 📚 **Context Grounding via RAG**:
  Processes uploaded documentation (PDF, Word, Plaintext), segments text into chunks, generates embeddings using `gemini-embedding-001` (768 dimensions), and stores them in **Pinecone Serverless**. Prompts are grounded in your project's unique domain context.
* 📊 **Interactive Visual Workspace**:
  * **Database View**: Interactive Entity Relationship diagrams powered by `@xyflow/react` (React Flow) with draggable tables, field types, primary/foreign keys, and index badges.
  * **API Specification Browser**: Filterable REST endpoint documentation categorized by HTTP method, tags, parameter tables, request bodies, and response schemas.
  * **User Story Matrices**: Priority and role-filtered user stories mapped with acceptance criteria.
  * **Prose Document Editors**: Clean markdown reading and editing experience for BRD and SRS documents.
* 🪄 **In-Place AI Refinement & Section Regeneration**:
  Propose surgical edits or regenerate individual sections of documents using natural language instructions without having to regenerate entire documents from scratch.
* 🕰️ **Version Control & Snapshot Restore**:
  Every document edit and generation automatically snapshots a new version. Inspect complete version history, preview previous states, and revert with one click.
* 🔐 **Robust Dual-Mode Authentication**:
  Native email/password authentication using JWT tokens stored in secure, `httpOnly` cookies with bcrypt password hashing, paired with **Google OAuth 2.0** (Passport.js) and automatic account linking.
* 📦 **Export Engine**:
  Generate standalone or multi-document project blueprint archives in **Markdown** and **PDF** formats.

---

## 🏗️ System Architecture

BlueprintAI utilizes a **Modular Monolith** pattern on the backend and a **4-Layer Modular Architecture** on the frontend.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React 19 + Vite)                    │
│                                                                        │
│   UI (Pages / Components) ──► Custom Hooks ──► Context State ──► API  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTP (Cookies / JSON)
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js + Express 5)                   │
│                                                                        │
│   Routes ──► Middleware (Auth, RateLimiter) ──► Controllers ──► Engine │
│                                                                  │     │
│   ┌──────────────────────────────────────────────────────────────┘     │
│   ▼                                                                    │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │                         BLUEPRINT ENGINE                           │ │
│ │                                                                    │ │
│ │ ┌─────────────┐    ┌──────────────┐    ┌─────────────────────────┐ │ │
│ │ │   Context   │───►│ RAG Service  │───►│ Multi-LLM Orchestrator  │ │ │
│ │ │   Builder   │    │  (Pinecone)  │    │  Gemini ──► Groq ──► OR │ │ │
│ │ └─────────────┘    └──────────────┘    └────────────┬────────────┘ │ │
│ │                                                     │              │ │
│ │ ┌─────────────┐    ┌──────────────┐                 ▼              │ │
│ │ │ Mongoose DB │◄───│  Validators  │◄─── Document Generators      │ │ │
│ │ │ Persistence │    │ (Zod / JSON) │     (BRD, SRS, API, DB...)   │ │ │
│ │ └─────────────┘    └──────────────┘                                │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Frontend 4-Layer Architecture Rules
1. **UI Layer (`pages/`, `components/`)**: Renders layout, handles user events, delegates actions to hooks. Never imports Axios or touches raw storage.
2. **Hooks Layer (`hooks/`)**: Orchestrates feature business logic, calls API services, updates Context State, exposes clean loading/error signals.
3. **State Layer (`*.context.jsx`)**: Holds global/feature shared memory (`user`, `activeDocument`, `project`). Pure state setters only.
4. **API Layer (`services/*.api.js`)**: Imports centralized Axios instance, executes HTTP calls with credentials, normalizes responses and error payloads.

---

## 🗄️ Database Models

BlueprintAI structures project planning as a connected document graph in **MongoDB Atlas**:

```
User (Local & Google OAuth credentials, roles)
 └─► Project (Title, description, tech stack, status)
       ├── Requirement (Functional & Non-Functional requirement catalog)
       ├── Document (BRD, SRS, UserStories, APISpec, DBSchema)
       │     └─► DocumentVersion (Snapshot records, changelogs, restore points)
       ├── Generation (Model execution audit logs, tokens, providers)
       └─► KnowledgeDocument (Uploaded source documents)
             └─► KnowledgeChunk (Vector-embedded segments in Pinecone)
```

---

## 🔌 API Endpoints Summary

All routes (except public auth & health) require JWT session verification via `protect` middleware.

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Health** | `GET` | `/api/health` | Service health status |
| **Auth** | `POST` | `/api/auth/register` | Create account & set session cookie |
| | `POST` | `/api/auth/login` | Email/password login |
| | `GET` | `/api/auth/google` | Google OAuth redirect |
| | `GET` | `/api/auth/google/callback` | Google OAuth callback & token issue |
| | `GET` | `/api/auth/me` | Fetch authenticated user profile |
| | `POST` | `/api/auth/logout` | Clear auth cookies |
| **Projects** | `GET` | `/api/projects` | List all user projects |
| | `POST` | `/api/projects` | Create a new project |
| | `GET` | `/api/projects/:id` | Get project overview & document statuses |
| | `PUT` | `/api/projects/:id` | Update project metadata |
| | `DELETE`| `/api/projects/:id` | Delete project and cascaded records |
| **Requirements** | `GET` | `/api/projects/:id/requirements` | Get requirement catalog |
| | `POST` | `/api/projects/:id/requirements` | Add manual requirement |
| | `POST` | `/api/projects/:id/requirements/analyze` | AI extraction from raw project scope |
| | `POST` | `/api/projects/:id/requirements/upload` | Upload & parse document file |
| **Generations** | `POST` | `/api/projects/:id/generations/:type` | Trigger document generation pipeline |
| | `GET` | `/api/projects/:id/generations/:type` | Fetch generation status & telemetry |
| **Documents** | `GET` | `/api/projects/:id/documents` | List project documents & completion summary |
| | `GET` | `/api/projects/:id/documents/:docType` | Retrieve active document content |
| | `PUT` | `/api/projects/:id/documents/:docType` | Save manual edits (creates new version) |
| | `GET` | `/api/projects/:id/documents/:docType/versions` | List all version snapshots |
| | `POST` | `/api/projects/:id/documents/:docType/restore/:version`| Restore to past snapshot |
| | `POST` | `/api/projects/:id/documents/:docType/refine` | AI Chat refinement proposal |
| | `POST` | `/api/projects/:id/documents/:docType/regenerate-section` | AI Section regeneration proposal |
| **Export** | `GET` | `/api/projects/:id/export?docType=...&format=...` | Download single or all docs as Markdown/PDF |

---

## 📁 Repository Structure

```
Blueprint-AI/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, env validation, passport OAuth
│   │   ├── controllers/        # Express route controllers
│   │   ├── engine/             # 🧠 AI Blueprint Engine
│   │   │   ├── analyzers/      # Requirement extraction & classification
│   │   │   ├── context/        # Multi-document contextual prompt builder
│   │   │   ├── core/           # Blueprint orchestrator & generation pipelines
│   │   │   ├── generators/     # Document generators (BRD, SRS, API, DB, Stories)
│   │   │   ├── prompts/        # System prompts & schema guidelines
│   │   │   ├── providers/      # LLM clients (Gemini, Groq, OpenRouter) & fallback
│   │   │   ├── rag/            # Embeddings, chunking, Pinecone vector store
│   │   │   ├── utils/          # Token counters & parsing sanitizers
│   │   │   └── validators/     # Zod schemas for structural schema conformance
│   │   ├── middleware/         # Auth verification, rate limiting, error handling
│   │   ├── models/             # Mongoose database models
│   │   ├── routes/             # Express API route modules
│   │   ├── services/           # Business logic & repository services
│   │   ├── utils/              # Token generators & helpers
│   │   ├── app.js              # Express app, middleware, routers
│   │   └── server.js           # Server bootstrap & DB connection
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/                 # Static public assets
│   ├── src/
│   │   ├── components/         # Common UI components (Navbar, Button, Modals)
│   │   ├── features/           # Modular feature domains
│   │   │   ├── ai/             # Analysis & AI orchestration views
│   │   │   ├── auth/           # Login, Register, Google OAuth buttons
│   │   │   ├── landing/        # Marketing landing page & hero animations
│   │   │   ├── projects/       # Dashboard & project management views
│   │   │   ├── requirements/   # Requirement management & file upload
│   │   │   └── workspace/      # Interactive blueprint editor studio
│   │   │       ├── components/ # ERD canvas, API explorer, version history
│   │   │       ├── hooks/      # Workspace state orchestration
│   │   │       └── services/   # Workspace API communication
│   │   ├── layouts/            # Dashboard & Auth layouts
│   │   ├── routes/             # App routing & route guards
│   │   ├── services/           # Central Axios HTTP client (`api.js`)
│   │   └── styles/             # Tailwind CSS & global animations
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── README.md
└── PROJECT_SPEC.md
```

---

## ⚙️ Quickstart & Local Setup

### 1. Prerequisites
* **Node.js** v20+
* **MongoDB** (Local instance or MongoDB Atlas cluster)
* *(Optional for AI)* **Google Gemini API Key** ([Google AI Studio](https://aistudio.google.com/))
* *(Optional for RAG)* **Pinecone API Key & Index** ([Pinecone Console](https://app.pinecone.io/))
* *(Optional for Google Sign-in)* **Google Cloud OAuth Client ID & Secret**

### 2. Clone Repository
```bash
git clone https://github.com/Akhiofficial/Blueprint-AI.git
cd Blueprint-AI
```

### 3. Backend Setup
Navigate to `/backend`, install dependencies, and create your environment file:
```bash
cd backend
npm install
cp .env.example .env
```

Configure `backend/.env`:
```env
# Server
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/blueprintai

# Authentication
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

# Google OAuth 2.0 (Optional for social login)
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# AI Providers (Google Gemini Primary)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
GEMINI_REFINEMENT_MODEL=gemini-3.6-flash
GEMINI_LIGHTWEIGHT_MODEL=gemini-3.5-flash-lite

# Fallback LLM Providers (Optional)
GROQ_API_KEY=
OPENROUTER_API_KEY=
LLM_FALLBACK_ORDER=gemini,groq,openrouter

# Pinecone Vector Store for RAG (Optional)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=blueprintai
```

### 4. Frontend Setup
Navigate to `/frontend`, install dependencies, and configure your environment:
```bash
cd ../frontend
npm install
```

Create or verify `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

### 5. Start Development Servers

Run the backend server:
```bash
# In /backend
npm run dev
```

Run the frontend client:
```bash
# In /frontend
npm run dev
```

Open your browser at **[http://localhost:5173](http://localhost:5173)** to explore BlueprintAI.

---

## 👨‍💻 Authors & Academic Context

* **Akhil** — Final Year Engineering Capstone Project
* Developed as an advanced full-stack research platform showcasing automated software synthesis, agentic RAG workflows, and enterprise document generation.

---

## 📄 License

This repository is distributed for academic, educational, and research presentation purposes.
