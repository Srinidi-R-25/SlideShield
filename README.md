# 🛡️ SlideShield — AI-Powered Community Landslide Early Warning & Rescue Platform

> Production-ready full-stack disaster management system built with Next.js 14, FastAPI, Google Gemini AI, Leaflet Maps, and PostgreSQL.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Python 3.14** (installed at `C:\Users\LENOVO SLIM 3 008\AppData\Local\Programs\Python\Python314\`)
- **Node.js 24+** / npm 11+

---

### 1. Start Backend (FastAPI)

```bash
cd SlideShield

# Install backend dependencies (first time)
"C:\Users\LENOVO SLIM 3 008\AppData\Local\Programs\Python\Python314\python.exe" -m pip install -r backend/requirements.txt

# Start the FastAPI server
"C:\Users\LENOVO SLIM 3 008\AppData\Local\Programs\Python\Python314\python.exe" -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

The backend runs on: **http://localhost:8000**
API Interactive Docs: **http://localhost:8000/docs**

---

### 2. Start Frontend (Next.js)

```bash
cd SlideShield/frontend

# Install dependencies (first time)
npm install

# Start development server
npm run dev
```

The frontend runs on: **http://localhost:3000**

---

## 🔑 Demo Credentials (Pre-seeded)

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| Citizen | citizen@slideshield.org | citizen123 | /citizen |
| Government Officer | officer@slideshield.org | officer123 | /government |
| Admin | admin@slideshield.org | admin123 | /admin |

**Or use the 1-Click Demo Login buttons** on the Login page.

---

## 🏗️ Project Structure

```
SlideShield/
├── backend/                   # FastAPI Backend
│   ├── main.py                # App entry point
│   ├── config.py              # Settings & environment
│   ├── database.py            # SQLAlchemy setup
│   ├── models.py              # Database models
│   ├── schemas.py             # Pydantic validation
│   ├── auth.py                # JWT authentication
│   ├── ai_service.py          # Gemini AI + smart fallbacks
│   ├── seed.py                # Demo data seeder
│   ├── routers/               # API route handlers
│   │   ├── auth.py            # /api/auth
│   │   ├── reports.py         # /api/reports
│   │   ├── alerts.py          # /api/alerts
│   │   ├── sos.py             # /api/sos
│   │   ├── shelters.py        # /api/shelters
│   │   ├── ai.py              # /api/ai
│   │   ├── admin.py           # /api/admin
│   │   └── analytics.py       # /api/analytics
│   ├── requirements.txt
│   ├── render.yaml            # Render deployment config
│   └── .env.example
│
└── frontend/                  # Next.js Frontend
    ├── src/
    │   ├── app/               # Next.js App Router
    │   │   ├── page.tsx       # Landing Page
    │   │   ├── login/         # Auth Login
    │   │   ├── register/      # Registration
    │   │   ├── citizen/       # Citizen Dashboard
    │   │   ├── government/    # Government Control Center
    │   │   └── admin/         # Admin Command Center
    │   ├── components/        # Shared UI Components
    │   ├── context/           # AuthContext
    │   ├── lib/               # API client, Types
    │   └── styles/            # Global CSS
    ├── tailwind.config.js
    ├── next.config.js
    ├── vercel.json            # Vercel deployment config
    └── .env.local.example
```

---

## 🤖 AI Features

| Feature | Description |
|---------|-------------|
| **AI Hazard Vision Scanner** | Analyzes uploaded slope images for Landslide, Rockfall, Soil Erosion, Flood indicators |
| **AI Risk Calculator** | Multi-parameter risk score using rainfall, slope angle, soil type, and historical data |
| **AI Report Summarizer** | Converts detailed citizen reports into concise officer-ready summaries |
| **AI Emergency Chatbot** | Safety tips, shelter locations, emergency contacts, government schemes |

---

## 🌐 Deployment

### Frontend → Vercel
1. Push the `frontend/` folder to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Set `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`

### Backend → Render
1. Push the entire repository to GitHub
2. Create a new Web Service on [render.com](https://render.com)
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
5. Set environment variables: `DATABASE_URL`, `SECRET_KEY`, `GEMINI_API_KEY`

---

## 🔒 Security Features
- JWT Bearer token authentication
- Role-Based Access Control (RBAC)
- bcrypt password hashing
- SQL injection protection via SQLAlchemy ORM
- XSS protection via React
- Input validation via Pydantic schemas
- CORS middleware with configurable origins

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| Maps | Leaflet + React-Leaflet |
| Charts | Recharts |
| Backend | FastAPI, Python 3.14 |
| Database | SQLite (dev) / PostgreSQL Neon (production) |
| AI | Google Gemini 1.5 Flash (+ offline heuristic fallback) |
| Auth | JWT tokens via python-jose + bcrypt |

---

*Built for Smart India Hackathon 2026 — Community Disaster Resilience & AI-Powered Emergency Response.*
