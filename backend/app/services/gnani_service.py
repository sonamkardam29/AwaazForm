import io
import os
import base64
import logging
import requests
from typing import Dict, Any, Optional, Tuple
from app.utils.config import (
    GNANI_API_KEY,
    GNANI_PRISMA_URL,
    GNANI_TIMBRE_URL,
    GNANI_EVON_URL,
    mask_sensitive
)

logger = logging.getLogger("awaazform.gnani")

# Presets for instant testing/demo scenarios
SAMPLE_PRESETS = {
    "rahul_scholarship_intro": "My name is Rahul Sharma, age 21, I live in Ghaziabad, I am pursuing B.Tech in Computer Science at ABES Engineering College.",
    "rahul_scholarship_hinglish": "Mera naam Rahul Sharma hai, meri umar 21 saal hai, main Ghaziabad me rehta hoon, aur ABES Engineering College se B.Tech Computer Science kar raha hoon.",
    "rahul_age_correction": "My age is 22, not 21.",
    "rahul_city_correction": "Change my city to Dadri.",
    "rahul_phone_update": "My mobile number is 9876543210 and my PIN code is 201001.",
    "rahul_income_answer": "My family annual income is 180000 rupees.",
    "rahul_dob_answer": "My date of birth is 15 August 2003.",
    "rahul_address_answer": "124 Shanti Nagar, Near Clock Tower, Dadri, Uttar Pradesh"
}

class GnaniService:
    def __init__(self):
        self.api_key = GNANI_API_KEY
        self.prisma_url = GNANI_PRISMA_URL
        self.timbre_url = GNANI_TIMBRE_URL
        self.evon_url = GNANI_EVON_URL

    def has_credentials(self) -> bool:
        return bool(self.api_key and self.api_key.strip() and self.api_key != "your_gnani_api_key_here")

    def transcribe_audio(self, audio_bytes: bytes, filename: str = "recording.wav", language_code: str = "indic-auto") -> Dict[str, Any]:
        """
        Transcribes speech using Gnani Prisma STT if API key is present.
        If credentials are not configured, uses demo fallback.
        Explicitly distinguishes between Gnani Prisma and Demo Mock.
        """
        if self.has_credentials():
            try:
                logger.info(f"Invoking Gnani Prisma STT at {self.prisma_url} for audio size {len(audio_bytes)} bytes")
                headers = {
                    "X-API-Key-ID": self.api_key
                }
                files = {
                    "audio_file": (filename, audio_bytes, "audio/wav")
                }
                data = {
                    "model": "prisma-v3.0",
                    "language_code": language_code
                }
                response = requests.post(self.prisma_url, headers=headers, files=files, data=data, timeout=15)
                if response.status_code == 200:
                    resp_json = response.json()
                    transcript = resp_json.get("transcript") or resp_json.get("text") or resp_json.get("result", "")
                    return {
                        "transcript": transcript,
                        "provider": "gnani-prisma",
                        "model": "prisma-v3.0",
                        "confidence": resp_json.get("confidence", 0.94),
                        "language": language_code,
                        "is_mock": False
                    }
                else:
                    logger.warning(f"Gnani Prisma API error {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"Failed to reach Gnani Prisma STT: {str(e)}")

        # Fallback Demo Mock
        # Return structured mock with explicit is_mock flag
        logger.info("Using Demo Mock STT provider (Gnani credentials not set or unavailable)")
        # If audio is very short or default sample
        default_text = SAMPLE_PRESETS["rahul_scholarship_hinglish"]
        return {
            "transcript": default_text,
            "provider": "demo-mock",
            "model": "simulated-prisma-v3",
            "confidence": 0.92,
            "language": "hi-IN / Hinglish",
            "is_mock": True,
            "notice": "Simulated transcription: Configure GNANI_API_KEY in .env for live Gnani Prisma API."
        }

    def synthesize_speech(self, text: str, language: str = "hi-IN", voice: str = "Nalini") -> Dict[str, Any]:
        """
        Synthesizes speech using Gnani Timbre TTS if API key is present.
        Falls back to client-side browser Web Speech synthesis.
        """
        if self.has_credentials():
            try:
                logger.info(f"Invoking Gnani Timbre TTS at {self.timbre_url} for text: {mask_sensitive(text)}")
                headers = {
                    "X-API-Key-ID": self.api_key,
                    "Content-Type": "application/json"
                }
                payload = {
                    "text": text,
                    "voice": voice,
                    "model": "timbre-v2.5",
                    "language": language,
                    "speed": 1.0,
                    "audio_config": {
                        "encoding": "linear_pcm",
                        "container": "wav",
                        "num_channels": 1,
                        "sample_rate": 24000,
                        "sample_width": 2
                    }
                }
                response = requests.post(self.timbre_url, json=payload, headers=headers, timeout=12)
                if response.status_code == 200:
                    resp_json = response.json()
                    # Could contain base64 audio or audio_url
                    audio_b64 = resp_json.get("audio_content") or resp_json.get("audio_base64")
                    return {
                        "provider": "gnani-timbre",
                        "model": "timbre-v2.5",
                        "audio_base64": audio_b64,
                        "audio_url": resp_json.get("audio_url"),
                        "is_mock": False
                    }
                else:
                    logger.warning(f"Gnani Timbre API error {response.status_code}: {response.text}")
            except Exception as e:
                logger.error(f"Failed to reach Gnani Timbre TTS: {str(e)}")

        return {
            "provider": "browser-synth",
            "model": "web-speech-api",
            "audio_base64": None,
            "audio_url": None,
            "is_mock": True,
            "message": "Gnani Timbre key not configured; using browser speech synthesis for audio playback."
        }

gnani_service = GnaniService()
