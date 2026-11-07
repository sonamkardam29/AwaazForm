import logging
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from app.models.schemas import (
    SessionState, FieldStatus, FieldSource,
    ExtractionRequest, CorrectionRequest,
    ClarificationResponseRequest, VerifyFieldRequest
)
from app.services.storage_service import storage_service
from app.services.extraction_service import extraction_service
from app.services.correction_service import correction_service
from app.services.clarification_service import clarification_service

router = APIRouter(prefix="/api/forms", tags=["Forms"])
logger = logging.getLogger("awaazform.routes.forms")

@router.get("/templates")
def get_templates():
    return storage_service.get_templates()

@router.post("/session")
def create_session(form_id: str = "scholarship"):
    session_id = str(uuid.uuid4())
    state = storage_service.create_session(session_id, form_id)
    return state

@router.get("/session/{session_id}")
def get_session(session_id: str):
    state = storage_service.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")
    return state

@router.post("/extract")
def extract_fields(req: ExtractionRequest):
    state = storage_service.get_session(req.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    extracted = extraction_service.extract_fields(req.text)
    state.transcripts.append({
        "timestamp": datetime.now().isoformat(),
        "text": req.text,
        "source": req.source,
        "extracted_keys": list(extracted.keys())
    })

    # Apply extracted values
    # IMPORTANT RULE: Do not mark a field verified simply because the AI extracted it.
    # Verification requires user confirmation or an appropriate validation check.
    for k, item in extracted.items():
        if k in state.fields:
            field = state.fields[k]
            prev = field.value
            field.value = item["value"]
            field.status = FieldStatus.NEEDS_CONFIRMATION
            field.source = FieldSource.VOICE
            field.previous_value = prev

    storage_service.save_session(state)

    # Next clarification if any
    clarification = clarification_service.get_next_clarification(state)
    state.clarification_pending = clarification
    storage_service.save_session(state)

    return {
        "success": True,
        "extracted": extracted,
        "state": state,
        "clarification": clarification
    }

@router.post("/correct")
def correct_fields(req: CorrectionRequest):
    state = storage_service.get_session(req.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    result = correction_service.process_correction(state, req.text)
    storage_service.save_session(state)
    return {
        "result": result,
        "state": state
    }

@router.get("/clarify/{session_id}")
def get_clarification(session_id: str):
    state = storage_service.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    clarification = clarification_service.get_next_clarification(state)
    state.clarification_pending = clarification
    storage_service.save_session(state)
    return {"clarification": clarification}

@router.post("/clarify")
def answer_clarification(req: ClarificationResponseRequest):
    state = storage_service.get_session(req.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    result = clarification_service.apply_answer(state, req.field_key, req.answer_text)
    next_clarification = clarification_service.get_next_clarification(state)
    state.clarification_pending = next_clarification
    storage_service.save_session(state)

    return {
        "result": result,
        "state": state,
        "next_clarification": next_clarification
    }

@router.post("/verify-field")
def verify_field(req: VerifyFieldRequest):
    state = storage_service.get_session(req.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    if req.field_key not in state.fields:
        raise HTTPException(status_code=400, detail="Invalid field key")

    field = state.fields[req.field_key]
    if req.value is not None:
        field.value = req.value
        field.source = FieldSource.MANUAL

    field.status = FieldStatus.VERIFIED if req.verified else FieldStatus.NEEDS_CONFIRMATION
    field.has_conflict = False
    field.conflict_detail = None
    storage_service.save_session(state)

    return {
        "success": True,
        "state": state
    }

@router.post("/confirm-all/{session_id}")
def confirm_all_fields(session_id: str):
    state = storage_service.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    for k, field in state.fields.items():
        if field.value and field.status != FieldStatus.INVALID:
            field.status = FieldStatus.VERIFIED
            field.has_conflict = False
            field.conflict_detail = None

    storage_service.save_session(state)
    return {
        "success": True,
        "is_all_confirmed": state.is_all_confirmed,
        "state": state
    }

@router.delete("/session/{session_id}")
def delete_session(session_id: str):
    deleted = storage_service.delete_session(session_id)
    return {"success": deleted, "message": "Session and all associated temporary data deleted successfully."}
