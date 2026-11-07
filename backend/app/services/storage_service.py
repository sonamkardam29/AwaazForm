import sqlite3
import json
import os
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.models.schemas import FormField, FormTemplate, SessionState, FieldStatus

DB_FILE = os.path.join(os.path.dirname(__file__), "..", "..", "awaazform.db")

SCHOLARSHIP_FIELDS = [
    FormField(key="full_name", label_en="Full Name", label_hi="पूरा नाम", is_required=True, field_type="text"),
    FormField(key="dob", label_en="Date of Birth", label_hi="जन्मतिथि (दिन-महीना-वर्ष)", is_required=True, field_type="date"),
    FormField(key="age", label_en="Age", label_hi="उम्र (वर्ष)", is_required=True, field_type="number"),
    FormField(key="mobile", label_en="Mobile Number", label_hi="मोबाइल नंबर", is_required=True, field_type="phone"),
    FormField(key="email", label_en="Email Address", label_hi="ईमेल पता", is_required=False, field_type="email"),
    FormField(key="address", label_en="Residential Address", label_hi="घर का पता", is_required=True, field_type="text"),
    FormField(key="city", label_en="City / Town", label_hi="शहर / कस्बा", is_required=True, field_type="text"),
    FormField(key="state", label_en="State", label_hi="राज्य", is_required=True, field_type="text"),
    FormField(key="pincode", label_en="PIN Code", label_hi="पिन कोड", is_required=True, field_type="number"),
    FormField(key="course", label_en="Course / Degree", label_hi="पाठ्यक्रम (कोर्स)", is_required=True, field_type="text"),
    FormField(key="college", label_en="College / Institute", label_hi="कॉलेज / संस्थान का नाम", is_required=True, field_type="text"),
    FormField(key="family_income", label_en="Annual Family Income", label_hi="वार्षिक पारिवारिक आय", is_required=True, field_type="currency")
]

BASIC_PERSONAL_FIELDS = [
    FormField(key="full_name", label_en="Full Name", label_hi="पूरा नाम", is_required=True, field_type="text"),
    FormField(key="dob", label_en="Date of Birth", label_hi="जन्मतिथि", is_required=True, field_type="date"),
    FormField(key="age", label_en="Age", label_hi="उम्र", is_required=True, field_type="number"),
    FormField(key="mobile", label_en="Mobile Number", label_hi="मोबाइल नंबर", is_required=True, field_type="phone"),
    FormField(key="email", label_en="Email Address", label_hi="ईमेल", is_required=False, field_type="email"),
    FormField(key="address", label_en="Address", label_hi="पता", is_required=True, field_type="text"),
    FormField(key="city", label_en="City", label_hi="शहर", is_required=True, field_type="text"),
    FormField(key="state", label_en="State", label_hi="राज्य", is_required=True, field_type="text"),
    FormField(key="pincode", label_en="PIN Code", label_hi="पिन कोड", is_required=True, field_type="number")
]

TEMPLATES: Dict[str, FormTemplate] = {
    "scholarship": FormTemplate(
        id="scholarship",
        title_en="Scholarship Application (छात्रवृत्ति आवेदन)",
        title_hi="छात्रवृत्ति आवेदन पत्र",
        description_en="Higher education merit and need-based scholarship application form.",
        description_hi="उच्च शिक्षा योग्यता और आवश्यकता आधारित छात्रवृत्ति आवेदन पत्र।",
        icon="GraduationCap",
        fields=SCHOLARSHIP_FIELDS
    ),
    "personal": FormTemplate(
        id="personal",
        title_en="Basic Personal Information (व्यक्तिगत विवरण)",
        title_hi="मूल व्यक्तिगत जानकारी पत्र",
        description_en="Standard citizen identification and personal details form.",
        description_hi="नागरिक पहचान और व्यक्तिगत विवरण हेतु मानक प्रपत्र।",
        icon="UserCheck",
        fields=BASIC_PERSONAL_FIELDS
    )
}

class StorageService:
    def __init__(self):
        self._init_db()

    def _get_conn(self):
        return sqlite3.connect(DB_FILE)

    def _init_db(self):
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS sessions (
                    session_id TEXT PRIMARY KEY,
                    form_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    data_json TEXT NOT NULL
                )
            ''')
            conn.commit()

    def get_templates(self) -> List[FormTemplate]:
        return list(TEMPLATES.values())

    def get_template(self, form_id: str) -> Optional[FormTemplate]:
        return TEMPLATES.get(form_id)

    def create_session(self, session_id: str, form_id: str) -> SessionState:
        tmpl = TEMPLATES.get(form_id, TEMPLATES["scholarship"])
        fields_dict = {f.key: f.model_copy() for f in tmpl.fields}
        now = datetime.now().isoformat()
        state = SessionState(
            session_id=session_id,
            form_id=form_id,
            created_at=now,
            updated_at=now,
            fields=fields_dict
        )
        self.save_session(state)
        return state

    def get_session(self, session_id: str) -> Optional[SessionState]:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT data_json FROM sessions WHERE session_id = ?", (session_id,))
            row = cursor.fetchone()
            if not row:
                return None
            data = json.loads(row[0])
            # Reconstruct FormField objects
            fields_obj = {k: FormField(**v) for k, v in data.get("fields", {}).items()}
            data["fields"] = fields_obj
            return SessionState(**data)

    def save_session(self, state: SessionState):
        state.updated_at = datetime.now().isoformat()
        # Check if all required fields are verified
        all_req_verified = True
        for f in state.fields.values():
            if f.is_required:
                if f.status != FieldStatus.VERIFIED or not f.value:
                    all_req_verified = False
                    break
            elif f.value and f.status != FieldStatus.VERIFIED:
                all_req_verified = False
                break
        state.is_all_confirmed = all_req_verified

        with self._get_conn() as conn:
            cursor = conn.cursor()
            data_dict = state.model_dump()
            cursor.execute('''
                INSERT OR REPLACE INTO sessions (session_id, form_id, created_at, updated_at, data_json)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                state.session_id,
                state.form_id,
                state.created_at,
                state.updated_at,
                json.dumps(data_dict, default=str)
            ))
            conn.commit()

    def delete_session(self, session_id: str) -> bool:
        with self._get_conn() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM sessions WHERE session_id = ?", (session_id,))
            conn.commit()
            return cursor.rowcount > 0

storage_service = StorageService()
