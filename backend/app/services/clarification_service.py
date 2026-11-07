import logging
from typing import Dict, Any, Optional
from app.models.schemas import SessionState, FieldStatus, FieldSource
from app.services.extraction_service import extraction_service
from app.services.gnani_service import gnani_service
from app.utils.config import mask_sensitive

logger = logging.getLogger("awaazform.clarification")

CLARIFICATION_PROMPTS = {
    "full_name": {
        "question_en": "Please tell me your full legal name as it appears on official documents.",
        "question_hi": "कृपया आधिकारिक दस्तावेजों के अनुसार अपना पूरा नाम बताइए।"
    },
    "dob": {
        "question_en": "What is your date of birth? (For example: 15 August 2003)",
        "question_hi": "आपकी जन्मतिथि क्या है? (जैसे: 15 अगस्त 2003)"
    },
    "age": {
        "question_en": "What is your current age in years?",
        "question_hi": "आपकी वर्तमान उम्र कितने वर्ष है?"
    },
    "mobile": {
        "question_en": "Please provide your 10-digit mobile phone number.",
        "question_hi": "कृपया अपना 10 अंकों का मोबाइल नंबर बताइए।"
    },
    "email": {
        "question_en": "What is your email address?",
        "question_hi": "कृपया अपना ईमेल पता बताइए।"
    },
    "address": {
        "question_en": "What is your permanent residential address (house number, street or locality)?",
        "question_hi": "कृपया अपने घर का पूरा पता (मकान नंबर, मोहल्ला/सड़क) बताइए।"
    },
    "city": {
        "question_en": "Which city or town do you currently reside in?",
        "question_hi": "आप किस शहर या कस्बे में रहते हैं?"
    },
    "state": {
        "question_en": "Which state do you live in? (For example: Uttar Pradesh)",
        "question_hi": "आप किस राज्य में रहते हैं? (जैसे: उत्तर प्रदेश)"
    },
    "pincode": {
        "question_en": "What is your 6-digit postal PIN code?",
        "question_hi": "आपके इलाके का 6 अंकों का पिन कोड क्या है?"
    },
    "course": {
        "question_en": "Which course or degree program are you currently enrolled in?",
        "question_hi": "आप वर्तमान में कौन सा कोर्स या डिग्री कर रहे हैं?"
    },
    "college": {
        "question_en": "What is the name of your college, university, or educational institute?",
        "question_hi": "आपके कॉलेज या विश्वविद्यालय का नाम क्या है?"
    },
    "family_income": {
        "question_en": "What is your family's total annual income from all sources in rupees?",
        "question_hi": "सभी स्रोतों से आपके परिवार की कुल वार्षिक आय (रुपये में) कितनी है?"
    }
}

class ClarificationService:
    def get_next_clarification(self, state: SessionState) -> Optional[Dict[str, Any]]:
        """
        Finds the highest-priority field needing attention:
        1. Conflicted fields first.
        2. Missing required fields next.
        3. Unconfirmed required fields.
        """
        # 1. First priority: Conflicting field
        for key, field in state.fields.items():
            if field.has_conflict:
                conflict = field.conflict_detail or {}
                doc_val = conflict.get("document_value", "Unknown")
                usr_val = field.value or "Not provided"
                return {
                    "field_key": key,
                    "type": "conflict",
                    "field_label_en": field.label_en,
                    "field_label_hi": field.label_hi,
                    "question_en": f"Conflict detected for {field.label_en}: Document shows '{doc_val}' while you provided '{usr_val}'. Which one should we keep?",
                    "question_hi": f"{field.label_hi} में अंतर पाया गया: दस्तावेज़ में '{doc_val}' है और आपने '{usr_val}' बताया। कौन सा मान सही है?",
                    "options": [
                        {"value": usr_val, "label": f"Keep voice value ({usr_val})", "source": "voice"},
                        {"value": doc_val, "label": f"Use document value ({doc_val})", "source": "document"}
                    ]
                }

        # 2. Second priority: Missing required fields
        # Priority ordering
        priority_keys = ["full_name", "mobile", "age", "dob", "city", "course", "college", "family_income", "address", "state", "pincode"]
        for key in priority_keys:
            if key in state.fields:
                field = state.fields[key]
                if field.is_required and (not field.value or field.status == FieldStatus.EMPTY or field.status == FieldStatus.INVALID):
                    prompt_info = CLARIFICATION_PROMPTS.get(key, {
                        "question_en": f"Please provide information for {field.label_en}.",
                        "question_hi": f"कृपया {field.label_hi} का विवरण दें।"
                    })
                    return {
                        "field_key": key,
                        "type": "missing",
                        "field_label_en": field.label_en,
                        "field_label_hi": field.label_hi,
                        "question_en": prompt_info["question_en"],
                        "question_hi": prompt_info["question_hi"],
                        "field_type": field.field_type
                    }

        # 3. Third priority: Needs confirmation
        for key, field in state.fields.items():
            if field.is_required and field.status == FieldStatus.NEEDS_CONFIRMATION and field.value:
                return {
                    "field_key": key,
                    "type": "unconfirmed",
                    "field_label_en": field.label_en,
                    "field_label_hi": field.label_hi,
                    "question_en": f"Please confirm if your {field.label_en} is '{field.value}'.",
                    "question_hi": f"कृपया पुष्टि करें कि क्या आपका {field.label_hi} '{field.value}' सही है?",
                    "current_value": field.value
                }

        return None

    def apply_answer(self, state: SessionState, field_key: str, answer_text: str) -> Dict[str, Any]:
        """
        Applies a user's spoken or typed answer to a clarification question.
        Updates the field and keeps it in NEEDS_CONFIRMATION until verified.
        """
        logger.info(f"Applying clarification for {field_key}: {mask_sensitive(answer_text)}")
        if field_key not in state.fields:
            return {"success": False, "message": "Unknown field"}

        # Attempt structured extraction on the answer
        extracted = extraction_service.extract_fields(answer_text)
        new_val = None
        if field_key in extracted:
            new_val = extracted[field_key]["value"]
        else:
            # Fallback: clean the direct answer text
            clean = answer_text.strip()
            # Remove filler words
            clean = re.sub(r'^(?:it is|my answer is|mera|meri|yes|ha|haan|the)\s+', '', clean, flags=re.IGNORECASE).strip()
            new_val = clean

        field = state.fields[field_key]
        old_val = field.value
        field.value = new_val
        # Rule: Do not mark a field verified simply because the AI extracted it.
        # It stays in NEEDS_CONFIRMATION so the user can review or confirm it!
        field.status = FieldStatus.NEEDS_CONFIRMATION
        field.previous_value = old_val
        field.source = FieldSource.VOICE
        field.has_conflict = False
        field.conflict_detail = None

        return {
            "success": True,
            "field_key": field_key,
            "new_value": new_val,
            "status": field.status,
            "message_en": f"Recorded {field.label_en} as '{new_val}'. Please verify when ready.",
            "message_hi": f"{field.label_hi} '{new_val}' दर्ज कर लिया गया है।"
        }

import re
clarification_service = ClarificationService()
