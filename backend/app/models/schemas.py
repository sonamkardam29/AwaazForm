from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class FieldStatus:
    VERIFIED = "verified"                  # Green
    NEEDS_CONFIRMATION = "needs_confirmation"  # Yellow
    INVALID = "invalid"                    # Red
    EMPTY = "empty"                        # Grey

class FieldSource:
    VOICE = "voice"
    DOCUMENT = "document"
    MANUAL = "manual"
    CORRECTION = "correction"

class FormField(BaseModel):
    key: str
    label_en: str
    label_hi: str
    value: Optional[str] = None
    status: str = FieldStatus.EMPTY
    source: Optional[str] = None
    previous_value: Optional[str] = None
    validation_error: Optional[str] = None
    is_required: bool = True
    field_type: str = "text"  # text, number, date, email, phone, currency
    options: Optional[List[str]] = None
    has_conflict: bool = False
    conflict_detail: Optional[Dict[str, Any]] = None

class FormTemplate(BaseModel):
    id: str
    title_en: str
    title_hi: str
    description_en: str
    description_hi: str
    icon: str
    fields: List[FormField]

class SessionState(BaseModel):
    session_id: str
    form_id: str
    created_at: str
    updated_at: str
    fields: Dict[str, FormField]
    transcripts: List[Dict[str, Any]] = []
    correction_history: List[Dict[str, Any]] = []
    document_matches: List[Dict[str, Any]] = []
    clarification_pending: Optional[Dict[str, Any]] = None
    is_all_confirmed: bool = False

class TranscribeRequest(BaseModel):
    language: str = "indic-auto"
    mock_preset: Optional[str] = None

class TranscribeResponse(BaseModel):
    transcript: str
    provider: str  # "gnani-prisma" or "demo-mock"
    confidence: float = 0.95
    language: str
    duration_seconds: float = 0.0

class ExtractionRequest(BaseModel):
    session_id: str
    text: str
    source: str = "voice"

class CorrectionRequest(BaseModel):
    session_id: str
    text: str

class ClarificationResponseRequest(BaseModel):
    session_id: str
    field_key: str
    answer_text: str

class ConflictResolutionRequest(BaseModel):
    session_id: str
    field_key: str
    chosen_value: str
    chosen_source: str  # "voice" or "document" or "manual"

class VerifyFieldRequest(BaseModel):
    session_id: str
    field_key: str
    value: Optional[str] = None
    verified: bool = True

class TTSRequest(BaseModel):
    text: str
    language: str = "hi-IN"
    voice: str = "Nalini"

class TTSResponse(BaseModel):
    provider: str  # "gnani-timbre" or "browser-synth"
    audio_base64: Optional[str] = None
    audio_url: Optional[str] = None
    message: Optional[str] = None
