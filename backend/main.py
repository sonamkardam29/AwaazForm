import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.utils.config import CORS_ORIGINS, ENVIRONMENT, GNANI_API_KEY
from app.routes.voice import router as voice_router
from app.routes.forms import router as forms_router
from app.routes.documents import router as documents_router
from app.routes.export import router as export_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s"
)
logger = logging.getLogger("awaazform.main")

app = FastAPI(
    title="AwaazForm API",
    description="Voice-First Intelligent Form Assistant Backend (Gnani Prisma STT, Evon Extraction, Timbre TTS & Document Cross-Validation)",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For local development across Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(voice_router)
app.include_router(forms_router)
app.include_router(documents_router)
app.include_router(export_router)

@app.get("/")
def root():
    return {
        "app": "AwaazForm API",
        "tagline": "Speak in your language. Complete your form with confidence.",
        "status": "healthy",
        "environment": ENVIRONMENT,
        "gnani_configured": bool(GNANI_API_KEY and GNANI_API_KEY != "your_gnani_api_key_here")
    }

@app.get("/health")
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
