import os
import re
from typing import Optional

GNANI_API_KEY = os.getenv("GNANI_API_KEY", "")
GNANI_PRISMA_URL = os.getenv("GNANI_PRISMA_URL", "https://api.vachana.ai/stt/v3")
GNANI_TIMBRE_URL = os.getenv("GNANI_TIMBRE_URL", "https://api.vachana.ai/api/v1/tts/inference")
GNANI_EVON_URL = os.getenv("GNANI_EVON_URL", "")

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "127.0.0.1")
CORS_ORIGINS = [orig.strip() for orig in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")]

# Safe logging helper that masks sensitive numbers like phone numbers, emails, incomes
def mask_sensitive(text: str) -> str:
    if not text:
        return text
    # Mask 10-digit mobile numbers: show first 2 and last 2
    masked = re.sub(r'(\b\d{2})\d{6}(\d{2}\b)', r'\1******\2', str(text))
    # Mask email username
    masked = re.sub(r'([a-zA-Z0-9_.+-])[a-zA-Z0-9_.+-]+@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', r'\1***@\2', masked)
    return masked
