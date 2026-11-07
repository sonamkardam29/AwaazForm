import io
import re
import os
import logging
from typing import Dict, Any, List, Optional
from pypdf import PdfReader
from app.models.schemas import SessionState, FieldStatus, FieldSource
from app.services.extraction_service import extraction_service
from app.utils.config import mask_sensitive

logger = logging.getLogger("awaazform.documents")

class DocumentService:
    def extract_text_from_file(self, file_bytes: bytes, filename: str) -> str:
        """
        Extracts raw text from PDF or text/sample document file.
        """
        lower = filename.lower()
        if lower.endswith(".pdf"):
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                text_pages = [page.extract_text() or "" for page in reader.pages]
                return "\n".join(text_pages)
            except Exception as e:
                logger.error(f"Error reading PDF: {e}")
                return ""
        else:
            try:
                return file_bytes.decode("utf-8", errors="ignore")
            except Exception as e:
                logger.error(f"Error decoding text: {e}")
                return ""

    def parse_document_fields(self, doc_text: str) -> Dict[str, Any]:
        """
        Parses document text looking for key fields:
        Name, DOB, College, Course, Annual Family Income, Address, etc.
        """
        doc_fields: Dict[str, Any] = {}
        clean_text = doc_text.strip()

        # Name
        m_name = re.search(r'(?:Student\s+Name|Candidate\s+Name|Name\s+of\s+Applicant|Name)\s*[:=]\s*([A-Za-z\s]+)', clean_text, re.IGNORECASE)
        if m_name:
            doc_fields["full_name"] = m_name.group(1).strip()

        # DOB
        m_dob = re.search(r'(?:Date\s+of\s+Birth|DOB)\s*[:=]\s*([0-9\-\/\.\sA-Za-z]+)', clean_text, re.IGNORECASE)
        if m_dob:
            doc_fields["dob"] = m_dob.group(1).strip().split("\n")[0]

        # College / Institute
        m_col = re.search(r'(?:College|Institute|Institution|University)\s*[:=]\s*([A-Za-z0-9\s,\.\-]+)', clean_text, re.IGNORECASE)
        if m_col:
            doc_fields["college"] = m_col.group(1).strip().split("\n")[0]

        # Course
        m_course = re.search(r'(?:Course|Program|Degree|Branch)\s*[:=]\s*([A-Za-z0-9\s,\.\-]+)', clean_text, re.IGNORECASE)
        if m_course:
            doc_fields["course"] = m_course.group(1).strip().split("\n")[0]

        # Annual Family Income
        m_income = re.search(r'(?:Annual\s+Family\s+Income|Family\s+Income|Annual\s+Income|Total\s+Income)\s*[:=]\s*(?:Rs\.?|INR)?\s*([0-9,]+)', clean_text, re.IGNORECASE)
        if m_income:
            inc_val = m_income.group(1).strip().replace(",", "")
            try:
                num = int(inc_val)
                doc_fields["family_income"] = f"₹{num:,}"
            except Exception:
                doc_fields["family_income"] = m_income.group(1).strip()

        # Mobile
        m_phone = re.search(r'(?:Mobile|Phone|Contact)\s*[:=]\s*([6-9]\d{9})', clean_text, re.IGNORECASE)
        if m_phone:
            doc_fields["mobile"] = m_phone.group(1).strip()

        # City / Address
        m_city = re.search(r'(?:City|District)\s*[:=]\s*([A-Za-z\s]+)', clean_text, re.IGNORECASE)
        if m_city:
            doc_fields["city"] = m_city.group(1).strip().split("\n")[0]

        return doc_fields

    def compare_and_apply_document(self, state: SessionState, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Extracts document fields, compares with existing user data:
        - If field is empty in form: populates with status=NEEDS_CONFIRMATION, source=DOCUMENT.
        - If field has existing value and they conflict:
          - Marks has_conflict = True
          - Keeps current value intact, sets status=NEEDS_CONFIRMATION
          - Records conflict_detail with both values and sources
        - Never silently overwrites user data.
        """
        raw_text = self.extract_text_from_file(file_bytes, filename)
        doc_fields = self.parse_document_fields(raw_text)

        conflicts = []
        applied_new = []
        matching = []

        for key, doc_val in doc_fields.items():
            if key not in state.fields:
                continue

            current_field = state.fields[key]
            curr_val = current_field.value

            # Normalize values for comparison
            norm_curr = re.sub(r'[^a-zA-Z0-9]', '', str(curr_val or '')).lower()
            norm_doc = re.sub(r'[^a-zA-Z0-9]', '', str(doc_val or '')).lower()

            if not curr_val or current_field.status == FieldStatus.EMPTY:
                # Field was empty: populate from document with confirmation required
                current_field.value = doc_val
                current_field.status = FieldStatus.NEEDS_CONFIRMATION
                current_field.source = FieldSource.DOCUMENT
                applied_new.append({"field_key": key, "value": doc_val})
            elif norm_curr != norm_doc and norm_curr != "" and norm_doc != "":
                # Conflict detected!
                current_field.has_conflict = True
                current_field.status = FieldStatus.NEEDS_CONFIRMATION
                current_field.conflict_detail = {
                    "field_key": key,
                    "field_label_en": current_field.label_en,
                    "field_label_hi": current_field.label_hi,
                    "user_value": curr_val,
                    "user_source": current_field.source or "voice",
                    "document_value": doc_val,
                    "document_source": f"Uploaded Document ({filename})",
                    "filename": filename
                }
                conflicts.append(current_field.conflict_detail)
            else:
                matching.append({"field_key": key, "value": curr_val})

        state.document_matches.append({
            "filename": filename,
            "extracted_fields": doc_fields,
            "conflicts_count": len(conflicts),
            "new_fields_count": len(applied_new)
        })

        return {
            "success": True,
            "filename": filename,
            "extracted_fields": doc_fields,
            "conflicts": conflicts,
            "applied_new": applied_new,
            "matching": matching,
            "message_en": f"Processed {filename}. Found {len(conflicts)} conflict(s) and filled {len(applied_new)} new field(s).",
            "message_hi": f"{filename} का विश्लेषण पूरा हुआ। {len(conflicts)} अंतर मिले और {len(applied_new)} नए विवरण जोड़े गए।"
        }

    def resolve_conflict(self, state: SessionState, field_key: str, chosen_value: str, chosen_source: str) -> Dict[str, Any]:
        """
        Allows the user to explicitly pick which value to use.
        """
        if field_key not in state.fields:
            return {"success": False, "message": "Unknown field"}

        field = state.fields[field_key]
        prev = field.value
        field.value = chosen_value
        field.source = chosen_source
        field.has_conflict = False
        field.conflict_detail = None
        # User explicitly resolved this field, but let's mark it as verified or needs_confirmation
        field.status = FieldStatus.VERIFIED
        field.previous_value = prev

        return {
            "success": True,
            "field_key": field_key,
            "chosen_value": chosen_value,
            "status": field.status,
            "message_en": f"Resolved conflict for {field.label_en}: set to '{chosen_value}'.",
            "message_hi": f"{field.label_hi} का मान '{chosen_value}' पर सेट किया गया।"
        }

document_service = DocumentService()
