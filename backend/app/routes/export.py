import logging
from fastapi import APIRouter, HTTPException, Response
from app.services.storage_service import storage_service
from app.services.pdf_service import pdf_service
from app.models.schemas import FieldStatus

router = APIRouter(prefix="/api/export", tags=["Export"])
logger = logging.getLogger("awaazform.routes.export")

@router.get("/pdf/{session_id}")
def export_pdf(session_id: str):
    state = storage_service.get_session(session_id)
    if not state:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check validation and confirmation:
    # "Do not allow final PDF generation until required fields are completed and the user confirms the information."
    unverified_required = []
    missing_required = []
    for k, field in state.fields.items():
        if field.is_required:
            if not field.value or field.status == FieldStatus.EMPTY:
                missing_required.append(field.label_en)
            elif field.status != FieldStatus.VERIFIED:
                unverified_required.append(field.label_en)

    if missing_required:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot generate PDF: Missing required fields: {', '.join(missing_required)}. Please complete them first."
        )

    if unverified_required:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot generate PDF: Please confirm all required fields before generating. Unverified: {', '.join(unverified_required)}."
        )

    template = storage_service.get_template(state.form_id)
    form_title = template.title_en if template else "Application Form"

    pdf_bytes = pdf_service.generate_form_pdf(state, form_title)

    filename = f"AwaazForm_{state.form_id}_{state.session_id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
    )
