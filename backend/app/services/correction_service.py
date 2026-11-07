import re
import logging
from typing import Dict, Any, Optional, Tuple, List
from app.models.schemas import SessionState, FieldStatus, FieldSource
from app.services.extraction_service import extraction_service, HINDI_NUMBERS
from app.utils.config import mask_sensitive

logger = logging.getLogger("awaazform.correction")

class CorrectionService:
    def process_correction(self, state: SessionState, text: str) -> Dict[str, Any]:
        """
        Parses user correction speech, identifies the intended field,
        preserves all other fields, and computes (previous_value, updated_value).
        If ambiguous, flags is_ambiguous: True and returns a question.
        """
        clean_text = text.strip()
        logger.info(f"Processing correction: {mask_sensitive(clean_text)}")

        # 1. Removal commands: "Remove my email address", "email hata do", "delete phone"
        remove_match = re.search(
            r'(?:remove|delete|hata do|clear)\s+(?:my\s+)?(email(?:\s+address)?|phone|mobile|address|income)',
            clean_text,
            re.IGNORECASE
        )
        if remove_match:
            target_raw = remove_match.group(1).lower()
            field_key = "email" if "email" in target_raw else ("mobile" if "phone" in target_raw or "mobile" in target_raw else target_raw)
            if field_key in state.fields:
                old_val = state.fields[field_key].value
                state.fields[field_key].value = None
                state.fields[field_key].status = FieldStatus.EMPTY
                state.fields[field_key].previous_value = old_val
                state.fields[field_key].source = FieldSource.CORRECTION
                record = {
                    "field_key": field_key,
                    "action": "removed",
                    "previous_value": old_val,
                    "new_value": None,
                    "user_text": text
                }
                state.correction_history.append(record)
                return {
                    "success": True,
                    "corrected_field": field_key,
                    "previous_value": old_val,
                    "new_value": None,
                    "action": "removed",
                    "message_en": f"Successfully removed {state.fields[field_key].label_en}.",
                    "message_hi": f"{state.fields[field_key].label_hi} हटा दिया गया है।"
                }

        # 2. "My age is 22, not 21" / "umar 22 hai 21 nahi" / "age 22 not 21"
        age_corr_match = re.search(
            r'(?:my\s+)?(?:age|umar|umr)\s*(?:is)?\s*(\d{1,2}|' + '|'.join(HINDI_NUMBERS.keys()) + r')\s*(?:,\s*|\s+)not\s*(\d{1,2}|' + '|'.join(HINDI_NUMBERS.keys()) + r')?',
            clean_text,
            re.IGNORECASE
        )
        if not age_corr_match:
            # "umar 22 hai 21 nahi"
            age_corr_match = re.search(
                r'(?:age|umar|umr)\s*(\d{1,2})\s*(?:hai|kar do)?\s*(\d{1,2})\s*(?:nahi|nhi)',
                clean_text,
                re.IGNORECASE
            )

        if age_corr_match:
            raw_new = age_corr_match.group(1).lower().strip()
            num_new = HINDI_NUMBERS.get(raw_new, raw_new)
            old_val = state.fields.get("age", None).value if "age" in state.fields else None
            state.fields["age"].value = str(int(num_new))
            state.fields["age"].status = FieldStatus.NEEDS_CONFIRMATION
            state.fields["age"].previous_value = old_val
            state.fields["age"].source = FieldSource.CORRECTION
            record = {
                "field_key": "age",
                "action": "updated",
                "previous_value": old_val,
                "new_value": str(int(num_new)),
                "user_text": text
            }
            state.correction_history.append(record)
            return {
                "success": True,
                "corrected_field": "age",
                "previous_value": old_val,
                "new_value": str(int(num_new)),
                "action": "updated",
                "message_en": f"Age updated from {old_val} to {num_new}.",
                "message_hi": f"उम्र {old_val} से बदलकर {num_new} कर दी गई है।"
            }

        # 3. Explicit "Change my [field] to [value]" / "Change [field] to [value]"
        # e.g., "Change my city to Dadri", "city badalkar Dadri karo", "Change my name to Rahul Kumar"
        change_match = re.search(
            r'(?:change|badal(?:kar)?|update|karo|kar do)\s*(?:my\s+)?(name|full name|city|age|mobile|phone|pincode|pin|course|college|income|address)?\s*(?:to|ko)?\s+([A-Za-z0-9\s,\.\-\#]+)',
            clean_text,
            re.IGNORECASE
        )
        if change_match and change_match.group(1):
            field_name_raw = change_match.group(1).lower().strip()
            target_val = change_match.group(2).strip()
            # Clean trailing words like "kar do", "karo", "please"
            target_val = re.sub(r'\b(kar do|karo|please|nhi|nahi)\b', '', target_val, flags=re.IGNORECASE).strip()
            # Strip trailing punctuation (. , ? ! ;)
            target_val = target_val.rstrip('.,?!;').strip()

            field_map = {
                "name": "full_name",
                "full name": "full_name",
                "city": "city",
                "age": "age",
                "mobile": "mobile",
                "phone": "mobile",
                "pincode": "pincode",
                "pin": "pincode",
                "course": "course",
                "college": "college",
                "income": "family_income",
                "address": "address"
            }
            field_key = field_map.get(field_name_raw)
            if field_key and field_key in state.fields:
                old_val = state.fields[field_key].value
                state.fields[field_key].value = target_val
                state.fields[field_key].status = FieldStatus.NEEDS_CONFIRMATION
                state.fields[field_key].previous_value = old_val
                state.fields[field_key].source = FieldSource.CORRECTION
                record = {
                    "field_key": field_key,
                    "action": "updated",
                    "previous_value": old_val,
                    "new_value": target_val,
                    "user_text": text
                }
                state.correction_history.append(record)
                return {
                    "success": True,
                    "corrected_field": field_key,
                    "previous_value": old_val,
                    "new_value": target_val,
                    "action": "updated",
                    "message_en": f"{state.fields[field_key].label_en} updated to {target_val}.",
                    "message_hi": f"{state.fields[field_key].label_hi} बदलकर {target_val} कर दिया गया है।"
                }

        # 4. Check for ambiguous number change, e.g. "Change to 201001" or "Make it 22"
        # If user just said "Make it 22" or "22 kar do", it's likely age.
        just_number_match = re.match(r'^(?:change\s+to|make\s+it|number\s+is)?\s*(\d+)\s*(?:kar do|karo)?$', clean_text, re.IGNORECASE)
        if just_number_match:
            num = just_number_match.group(1)
            if len(num) == 6:
                # Likely PIN code
                field_key = "pincode"
                old_val = state.fields[field_key].value
                state.fields[field_key].value = num
                state.fields[field_key].status = FieldStatus.NEEDS_CONFIRMATION
                state.fields[field_key].previous_value = old_val
                return {
                    "success": True,
                    "corrected_field": field_key,
                    "previous_value": old_val,
                    "new_value": num,
                    "action": "updated",
                    "message_en": f"PIN Code updated to {num}.",
                    "message_hi": f"पिन कोड {num} अपडेट किया गया।"
                }
            elif len(num) in (1, 2) and int(num) < 100:
                field_key = "age"
                old_val = state.fields[field_key].value
                state.fields[field_key].value = num
                state.fields[field_key].status = FieldStatus.NEEDS_CONFIRMATION
                state.fields[field_key].previous_value = old_val
                return {
                    "success": True,
                    "corrected_field": field_key,
                    "previous_value": old_val,
                    "new_value": num,
                    "action": "updated",
                    "message_en": f"Age updated to {num}.",
                    "message_hi": f"उम्र {num} अपडेट की गई।"
                }
            else:
                return {
                    "success": False,
                    "is_ambiguous": True,
                    "message_en": f"Did you mean to update your Age, Phone Number, or PIN Code to {num}?",
                    "message_hi": f"क्या आप अपनी उम्र, मोबाइल नंबर या पिन कोड को {num} में बदलना चाहते हैं?"
                }

        # 5. Extract using general extractor as fallback update
        extracted = extraction_service.extract_fields(clean_text)
        if extracted:
            corrected_keys = []
            for k, item in extracted.items():
                if k in state.fields:
                    old_val = state.fields[k].value
                    state.fields[k].value = item["value"]
                    state.fields[k].status = FieldStatus.NEEDS_CONFIRMATION
                    state.fields[k].previous_value = old_val
                    state.fields[k].source = FieldSource.CORRECTION
                    corrected_keys.append(k)
                    state.correction_history.append({
                        "field_key": k,
                        "action": "updated",
                        "previous_value": old_val,
                        "new_value": item["value"],
                        "user_text": text
                    })
            if corrected_keys:
                return {
                    "success": True,
                    "corrected_fields": corrected_keys,
                    "action": "updated",
                    "message_en": f"Updated fields: {', '.join(corrected_keys)}.",
                    "message_hi": f"अपडेट किए गए फ़ील्ड: {', '.join(corrected_keys)}"
                }

        # Ambiguous / Unrecognized correction
        return {
            "success": False,
            "is_ambiguous": True,
            "message_en": "I couldn't identify which field you want to change. Please say e.g., 'Change my age to 22' or 'Change my city to Dadri'.",
            "message_hi": "कृपया स्पष्ट करें कि आप कौन सा विवरण बदलना चाहते हैं, जैसे: 'मेरी उम्र 22 कर दो' या 'शहर दादरी कर दो'।",
            "user_text": text
        }

correction_service = CorrectionService()
