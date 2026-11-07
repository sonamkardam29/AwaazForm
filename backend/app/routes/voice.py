import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from app.services.gnani_service import gnani_service, SAMPLE_PRESETS
from app.models.schemas import TTSRequest, TTSResponse, TranscribeResponse

router = APIRouter(prefix="/api/voice", tags=["Voice"])
logger = logging.getLogger("awaazform.routes.voice")

@router.post("/transcribe")
async def transcribe_audio_endpoint(
    audio_file: Optional[UploadFile] = File(None),
    preset_key: Optional[str] = Form(None),
    language: str = Form("indic-auto")
):
    """
    Transcribes audio using Gnani Prisma STT if configured with GNANI_API_KEY.
    If no key or if a preset_key is given, provides an explicitly labelled demo mock.
    """
    if preset_key and preset_key in SAMPLE_PRESETS:
        return {
            "transcript": SAMPLE_PRESETS[preset_key],
            "provider": "demo-mock",
            "model": "preset-test-data",
            "confidence": 1.0,
            "language": "hi-IN / Hinglish",
            "is_mock": True,
            "notice": f"Preset test audio: '{preset_key}'"
        }

    if audio_file:
        audio_bytes = await audio_file.read()
        res = gnani_service.transcribe_audio(
            audio_bytes=audio_bytes,
            filename=audio_file.filename or "audio.wav",
            language_code=language
        )
        return res

    # If neither audio nor preset provided, return default sample
    return {
        "transcript": SAMPLE_PRESETS["rahul_scholarship_hinglish"],
        "provider": "demo-mock",
        "model": "simulated-prisma-v3",
        "confidence": 0.95,
        "language": "hi-IN",
        "is_mock": True,
        "notice": "Default mock sample transcript loaded."
    }

@router.post("/synthesize")
def synthesize_endpoint(req: TTSRequest):
    """
    Synthesizes speech using Gnani Timbre TTS or instructs frontend to use browser speech synthesis.
    """
    return gnani_service.synthesize_speech(
        text=req.text,
        language=req.language,
        voice=req.voice
    )

@router.get("/presets")
def get_presets():
    """
    Returns available realistic test presets for speech demo.
    """
    return {
        "presets": SAMPLE_PRESETS,
        "has_gnani_key": gnani_service.has_credentials()
    }
