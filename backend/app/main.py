from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="CareMate Backend", version="0.1.0")

# CORS (dev-friendly)
origins = os.getenv("ALLOW_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello from CareMate FastAPI"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Include API routers
from .api import predict as predict_router  # noqa: E402
app.include_router(predict_router.router)
from .api import reports as reports_router  # noqa: E402
app.include_router(reports_router.router)
from .api import dashboard as dashboard_router  # noqa: E402
app.include_router(dashboard_router.router)
from .api import doctor as doctor_router  # noqa: E402
app.include_router(doctor_router.router)
from .api import auth as auth_router  # noqa: E402
app.include_router(auth_router.router)
from .api import ai_chat as ai_chat_router  # noqa: E402
app.include_router(ai_chat_router.router)

# To run locally (optional):
# uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
