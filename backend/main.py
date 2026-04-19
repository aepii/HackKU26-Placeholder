from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from database import init_db
from routers import architecture_router, share_router
import os

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to initialize the database connection."""
    await init_db()
    yield

# Initialize FastAPI application with CORS middleware and include routers
app = FastAPI(title="System Architect Validator", lifespan=lifespan)

# Mount the uploads directory to serve uploaded files
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Serve static files from the uploads directory
app.include_router(architecture_router)
app.include_router(share_router)
