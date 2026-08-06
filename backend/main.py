from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
import sys

# Ensure parent directory of 'backend' is in sys.path so 'backend.module' imports succeed
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from backend.config import settings
from backend.database import engine, Base
from backend.seed import seed_db
from backend.routers import auth, reports, alerts, sos, shelters, ai, admin, analytics, notifications, feedback

# Create database tables
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Seed database with demo accounts and initial records if empty
    try:
        seed_db()
    except Exception as e:
        print(f"Startup seed notice: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production-Ready AI-Powered Community Landslide Early Warning & Rescue Assistant Platform",
    lifespan=lifespan
)

# CORS Setup - Allow Frontend connections
# NOTE: allow_credentials=True is incompatible with allow_origins=["*"].
# Specify explicit allowed origins, or set allow_credentials=False for public APIs.
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(alerts.router, prefix=settings.API_V1_STR)
app.include_router(sos.router, prefix=settings.API_V1_STR)
app.include_router(shelters.router, prefix=settings.API_V1_STR)
app.include_router(ai.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "title": "SlideShield AI Disaster Management Platform API",
        "status": "Online",
        "version": settings.VERSION,
        "docs": "/docs",
        "health": "/api/admin/system-health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
