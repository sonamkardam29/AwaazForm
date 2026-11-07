import os
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional, List
from app.services.storage_service import storage_service
from app.services.document_service import document_service
from app.models.schemas import ConflictResolutionRequest

router = APIRouter(prefix="/api/documents", tags=["Documents"])
logger = logging.getLogger("awaazform.routes.documents")

SAMPLE_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "sample_data")

@router.post("/upload")
async def upload_document(
    session_id: str = Form(...),
    consent_given: bool = Form(...),
    file: UploadFile = File(...)
):
    """
    Uploads a document (PDF or text) to extract fields and detect conflicts.
    Requires user consent per privacy guidelines.
    """
    if not consent_given:
        raise HTTPException(status_code=400, detail="User consent is required before processing document.")

    state = storage_service.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    file_bytes = await file.read()
    result = document_service.compare_and_apply_document(
        state=state,
        file_bytes=file_bytes,
        filename=file.filename or "sample_document.pdf"
    )
    storage_service.save_session(state)

    return {
        "result": result,
        "state": state
    }

@router.post("/resolve-conflict")
def resolve_conflict(req: ConflictResolutionRequest):
    state = storage_service.get_session(req.session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    res = document_service.resolve_conflict(
        state=state,
        field_key=req.field_key,
        chosen_value=req.chosen_value,
        chosen_source=req.chosen_source
    )
    storage_service.save_session(state)
    return {
        "result": res,
        "state": state
    }

@router.get("/samples")
def list_sample_documents():
    """
    Lists available pre-made sample documents to facilitate easy testing of document intelligence.
    """
    samples = [
        {
            "id": "marksheet_rahul",
            "name": "B.Tech Marksheet & Admission Slip (Rahul Sharma)",
            "filename": "sample_marksheet_rahul.txt",
            "description": "Contains candidate name, DOB (15/08/2003), College (ABES Engineering College), and conflicting Annual Family Income (₹2,50,000 vs user ₹1,80,000).",
            "has_conflict": True,
            "conflicting_field": "family_income"
        },
        {
            "id": "income_cert",
            "name": "State Revenue Department Income Certificate",
            "filename": "sample_income_cert.txt",
            "description": "Official income certificate verifying Annual Family Income as ₹1,80,000.",
            "has_conflict": False
        }
    ]
    return {"samples": samples}

@router.post("/load-sample")
def load_sample_document(session_id: str = Form(...), sample_id: str = Form(...), consent_given: bool = Form(...)):
    """
    Loads a pre-configured sample document directly into the session.
    """
    if not consent_given:
        raise HTTPException(status_code=400, detail="User consent is required before processing document.")

    state = storage_service.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    filename = "sample_marksheet_rahul.txt" if sample_id == "marksheet_rahul" else "sample_income_cert.txt"
    filepath = os.path.join(SAMPLE_DIR, filename)

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Sample document file {filename} not found.")

    with open(filepath, "rb") as f:
        file_bytes = f.read()

    result = document_service.compare_and_apply_document(
        state=state,
        file_bytes=file_bytes,
        filename=filename
    )
    storage_service.save_session(state)

    return {
        "result": result,
        "state": state
    }
