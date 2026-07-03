import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.core.database import Base, engine
from app.models import models  # noqa: F401 - ensures models are registered on Base

from app.api.routes import (
    auth, users, doctors, patients, appointments, prescriptions, records, messages, notifications, reviews, websocket
)

os.makedirs(settings.upload_dir, exist_ok=True)

app = FastAPI(title="Medicare API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(f"/{settings.upload_dir}", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(doctors.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(appointments.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(records.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(reviews.router, prefix="/api")
app.include_router(websocket.router)  # ws endpoints stay at root, not under /api


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print("=== VALIDATION ERROR ===")
    print("Path:", request.url.path)
    print("Errors:", exc.errors())
    print("Body:", exc.body)
    print("=========================")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"success": False, "message": "Internal server error"})


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.on_event("startup")
def on_startup():
    # For quick local dev. In production, use Alembic migrations instead.
    Base.metadata.create_all(bind=engine)