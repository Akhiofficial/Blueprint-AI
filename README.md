<div align="center">

# 🧠 BlueprintAI

### AI-Powered Software Planning & Development Blueprint Generation Platform

*Turn a software idea into structured, implementation-ready engineering planning documents.*

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

</div>

---

## 📌 What is BlueprintAI?

**BlueprintAI** is a centralized software planning platform that transforms raw ideas and descriptions into highly structured, connected software engineering documents. Unlike generic chatbot sessions where context is easily lost, BlueprintAI provides a structured workspace designed to keep all software decisions in sync.

### Core Workflow
```
[ Software Idea ]
       ↓
[ Scope & Requirements ]
       ↓
[ AI Requirement Analysis ]
       ↓
[ BRD ] → [ SRS ] → [ User Stories ] → [ Database Schema ] → [ REST API Design ]
       ↓
[ Edit / Regenerate / Verify ]
       ↓
[ Document Version Control ]
       ↓
[ PDF / Markdown Export ]
```

---

## 🚀 Project Phases & Roadmap

The development of BlueprintAI is organized into 18 distinct phases. 

| Phase | Scope | Status |
|---|---|---|
| **Phase 1** | Project Planning | ✅ Completed |
| **Phase 2** | UI/UX Design | ✅ Completed |
| **Phase 3** | System Architecture | ✅ Completed |
| **Phase 4** | Database Design | ✅ Completed |
| **Phase 5** | Backend Foundation | ✅ Completed |
| **Phase 6** | Authentication & Authorization | ✅ Completed |
| **Phase 7** | Frontend Redesign & Project Management | ⚡ **Current** |
| **Phase 8** | Requirement Management | ⏳ Upcoming |
| **Phase 9** | Blueprint Engine | ⏳ Upcoming |
| **Phase 10**| AI / Gemini Integration | ⏳ Upcoming |
| **Phase 11**| RAG & Knowledge Base | ⏳ Upcoming |
| **Phase 12**| AI Output Validation | ⏳ Upcoming |
| **Phase 13**| Document Versioning | ⏳ Upcoming |
| **Phase 14**| File Processing | ⏳ Upcoming |
| **Phase 15**| Export System | ⏳ Upcoming |
| **Phase 16**| Testing & Security Validation | ⏳ Upcoming |
| **Phase 17**| Deployment | ⏳ Upcoming |
| **Phase 18**| Final Documentation | ⏳ Upcoming |

---

## 🛠️ Implementation Status

### 1. Implemented & Verified Features
* **Landing Page Redesign**: High-fidelity dark mode marketing landing page featuring a floating pill navbar, a cursor-reactive interactive gradient orb hero, interactive product mockups, and scroll-driven timeline steps.
* **Authentication Experience**: Sleek login and registration views complete with validation handling, custom styling, httpOnly cookies, and a Google OAuth mock CTA layout.
* **Authentication Core**: Secure user registration, login, JWT token verification, httpOnly cookie storage, bcrypt password hashing, session persistence, and protective routes (`/api/auth/me`, `/me`).
* **Backend Foundation**: Express framework foundation, MongoDB Atlas connection pool, Mongoose object data modeling, standardized error/404 handling, request validations, and dotenv configuration.

### 2. Planned Features (In Development)
* **AI Requirements Parsing**: Extracting functional/non-functional requirements from text ideas.
* **Gemini AI Integration**: Connecting the Google Gemini API to orchestrate BRD, SRS, User Stories, DB Schema, and REST API generation.
* **Knowledge Base & RAG**: Using LangChain.js, vector embeddings, and a vector store (e.g., Pinecone/ChromaDB) to ground blueprint documents in provided project context.
* **Version Control**: Auto-saving and versioning schemas and specs over time with diff previews.
* **Document Exporting**: Compiling plans into PDF or raw Markdown.

---

## 🏗️ Architecture

BlueprintAI uses a **Modular Monolith** architecture pattern. Requests flow sequentially through standardized layers to ensure robust maintenance and scalability.

### Backend Request Flow
```
Route ──► Middleware (Auth/Validation) ──► Controller ──► Service ──► Mongoose Model ──► MongoDB
```

### Blueprint Engine (Planned Structure)
The core generation engine will reside inside `backend/src/engine/` using the following layout:
```
engine/
├── core/         # Core generation orchestrators
├── analyzers/    # Requirements extraction and text parsing
├── context/      # Prompt context state builders
├── generators/   # Document-specific generation routines
├── prompts/      # Structured system templates
├── providers/    # API connectors (Gemini / Vector stores)
├── rag/          # RAG utility functions
└── validators/   # Structural validation rules (Zod / JSON checks)
```

---

## 🗄️ Database Design

BlueprintAI maintains connected document graphs. The relationship flow is structured as follows:

```
User
  └─► Project
        ├── Requirements
        ├── Documents
        │     └─► Document Versions
        ├── Generations
        └─► Knowledge Documents
              └─► Knowledge Chunks
```

### Main Entities
* **User**: Profile, email, roles, and hashed credentials.
* **Project**: Owner, title, technology stack, and settings.
* **Requirement**: Parsed functional and non-functional requirements.
* **Document**: Structured blueprint sections (e.g. BRD, SRS, API docs).
* **DocumentVersion**: Version control records and schema updates.
* **Generation**: Auditing records of AI model prompts and outputs.
* **KnowledgeDocument**: Uploaded target source materials for RAG ingestion.
* **KnowledgeChunk**: Vectorized text segments for indexing.

---

## 📁 Repository Structure

```
BlueprintAI/
├── backend/
│   └── src/
│       ├── config/           # Database and general configurations
│       ├── controllers/      # Route handler definitions
│       ├── engine/           # AI Blueprint Engine (Planned)
│       ├── middleware/       # JWT auth, validator execution, error handler
│       ├── models/           # Mongoose schemas (User, Project, Document, etc.)
│       ├── routes/           # Express router endpoints
│       ├── services/         # Business logic layer
│       ├── utils/            # Shared helper functions
│       └── validators/       # Zod schemas for request validation
│
├── frontend/
│   ├── public/               # Static assets
│   └── src/
│       ├── components/       # Shared UI primitives (Button, Input, Loading...)
│       ├── features/         # Page modules using 4-layer architecture
│       │   ├── ai/           # AI configuration features
│       │   ├── auth/         # Login, registration, and auth hooks
│       │   ├── documents/    # Generated documents features
│       │   ├── landing/      # Redesigned marketing pages
│       │   ├── projects/     # Project dashboard & creation wizard
│       │   ├── requirements/ # Requirement parser views
│       │   └── workspace/    # Connected editor workspace
│       ├── hooks/            # Global custom React hooks
│       ├── layouts/          # AuthLayout, Navbar, etc.
│       ├── lib/              # Axios HTTP client configuration
│       ├── routes/           # AppRouter & ProtectedRoute definitions
│       ├── services/         # API connection handlers
│       └── utils/            # Helper utilities
│
├── docs/                     # Additional project documents
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Local Development Setup

### Prerequisites
* **Node.js** (v20+ recommended)
* **NPM** (v10+ recommended)
* A running **MongoDB** instance (local database or MongoDB Atlas cloud connection string)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd BlueprintAI
```

### 2. Configure Environment Variables

**Backend configuration** — Create a `backend/.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/blueprintai
JWT_SECRET=your_super_secret_jwt_sign_key_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Frontend configuration** — Create a `frontend/.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Install Dependencies
Install dependencies separately in both the frontend and backend project directories:
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 4. Run Development Servers
Start both servers concurrently during local development:

```bash
# Terminal 1 — Run Express Backend
cd backend
npm run dev

# Terminal 2 — Run Vite Frontend Client
cd frontend
npm run dev
```

The frontend application will be hosted locally at [http://localhost:5173](http://localhost:5173).

---

## 👨‍💻 Authors & Academic Context

* **Akhil** — Final Year Engineering Project
* Built as a production-grade MERN architecture for automated software documentation synthesis.

---

## 📄 License

This repository is created and maintained for academic, educational, and research project presentation purposes.
