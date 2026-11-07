import re
import logging
from typing import Dict, Any, Optional
from app.models.schemas import FieldStatus, FieldSource
from app.utils.config import mask_sensitive

logger = logging.getLogger("awaazform.extraction")

HINDI_NUMBERS = {
    "ek": "1", "do": "2", "teen": "3", "chaar": "4", "paanch": "5",
    "chhah": "6", "saat": "7", "aath": "8", "nau": "9", "das": "10",
    "gyaarah": "11", "baarah": "12", "terah": "13", "chaudah": "14", "pandrah": "15",
    "solah": "16", "satrah": "17", "athaarah": "18", "unnees": "19", "bees": "20",
    "ekkees": "21", "ekis": "21", "baees": "22", "bais": "22", "teis": "23",
    "chaubees": "24", "pachees": "25", "chhabees": "26", "sattaees": "27",
    "athaees": "28", "untees": "29", "tees": "30",
    "इक्कीस": "21", "बाईस": "22", "तेईस": "23", "चौबीस": "24", "पच्चीस": "25",
    "अठारह": "18", "उन्नीस": "19", "बीस": "20"
}

INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh", "UP", "MP"
]

class ExtractionService:
    def extract_fields(self, text: str) -> Dict[str, Dict[str, Any]]:
        """
        Extracts structured fields from natural speech (Hindi/Hinglish/English).
        Only extracts explicitly stated information. Never invents fields.
        Returns a dictionary of:
        { field_key: { "value": str, "confidence": float, "source": "voice" } }
        """
        logger.info(f"Extracting fields from text: {mask_sensitive(text)}")
        clean_text = text.strip()
        extracted: Dict[str, Dict[str, Any]] = {}

        # 1. Full Name Extraction
        # Patterns: "My name is Rahul Sharma", "Mera naam Rahul Sharma hai", "I am Rahul Sharma", "name Rahul Sharma"
        name_match = re.search(
            r'(?:my name is|mera naam|naam hai|naam|i am)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)',
            clean_text,
            re.IGNORECASE
        )
        if not name_match:
            # Hindi script: मेरा नाम राहुल शर्मा है
            name_match = re.search(r'(?:मेरा नाम|नाम)\s+([^\s,]+(?:\s+[^\s,]+){1,2})\s*(?:है)?', clean_text)

        if name_match:
            raw_name = name_match.group(1).strip()
            # filter out filler words like 'hai'
            raw_name = re.sub(r'\b(hai|hoon|ji|ka|ki)\b', '', raw_name, flags=re.IGNORECASE).strip()
            if len(raw_name.split()) >= 1 and len(raw_name) > 2:
                extracted["full_name"] = {
                    "value": raw_name.title() if raw_name.isascii() else raw_name,
                    "confidence": 0.95,
                    "source": FieldSource.VOICE
                }

        # 2. Age Extraction
        # Patterns: "age 21", "age is 21", "21 years old", "umar 21 saal", "21 saal", "उम्र 21"
        age_match = re.search(
            r'(?:age(?:\s+is)?|umar|umr|उम्र)\s*[:=]?\s*(\d{1,2}|' + '|'.join(HINDI_NUMBERS.keys()) + r')\b',
            clean_text,
            re.IGNORECASE
        )
        if not age_match:
            age_match = re.search(
                r'(\d{1,2})\s*(?:years old|year old|saal|साल|varsh|वर्ष)',
                clean_text,
                re.IGNORECASE
            )

        if age_match:
            raw_age = age_match.group(1).lower().strip()
            num_age = HINDI_NUMBERS.get(raw_age, raw_age)
            if num_age.isdigit() and 5 <= int(num_age) <= 100:
                extracted["age"] = {
                    "value": str(int(num_age)),
                    "confidence": 0.96,
                    "source": FieldSource.VOICE
                }

        # 3. City Extraction
        # Patterns: "live in Ghaziabad", "living in Dadri", "from Ghaziabad", "city Ghaziabad", "Ghaziabad me rehta"
        city_match = re.search(
            r'(?:live in|living in|from|city|shehar|rehta hoon|rehti hoon|resident of)\s+(?:in\s+)?([A-Za-z]+)',
            clean_text,
            re.IGNORECASE
        )
        if not city_match:
            city_match = re.search(r'([A-Za-z]+)\s+(?:me rehta|me rehti|city)', clean_text, re.IGNORECASE)

        if city_match:
            city_val = city_match.group(1).strip().capitalize()
            # Exclude prepositions or non-city words
            stop_words = {"A", "An", "The", "Here", "Near", "India", "My", "Home", "House", "Flat", "Street"}
            if city_val not in stop_words and len(city_val) > 2:
                extracted["city"] = {
                    "value": city_val,
                    "confidence": 0.90,
                    "source": FieldSource.VOICE
                }

        # 4. Course / Degree Extraction
        # Patterns: "pursuing B.Tech in Computer Science", "studying BCA", "course is B.Tech", "B.Tech Computer Science kar raha"
        course_match = re.search(
            r'(?:pursuing|studying|course(?:\s+is)?|enrolled in)\s+([A-Za-z0-9\.\-\s]+?(?:Engineering|Science|Commerce|Arts|Technology|Management|B\.Tech|M\.Tech|BCA|MCA|BSc|MSc|BBA|MBA|B\.Com|BA|MBBS|Diploma)[A-Za-z0-9\.\-\s]*)',
            clean_text,
            re.IGNORECASE
        )
        if not course_match:
            course_match = re.search(
                r'((?:B\.Tech|M\.Tech|BCA|MCA|BSc|MSc|BBA|MBA|B\.Com|BA)\s+(?:in\s+)?[A-Za-z\s]+?)(?:\s+(?:kar raha|at|from|in\b|,|\.|$))',
                clean_text,
                re.IGNORECASE
            )

        if course_match:
            course_val = course_match.group(1).strip()
            # Clean trailing words
            course_val = re.sub(r'\b(at|from|in|kar|raha|hoon)\b.*$', '', course_val, flags=re.IGNORECASE).strip()
            if len(course_val) > 2:
                extracted["course"] = {
                    "value": course_val,
                    "confidence": 0.93,
                    "source": FieldSource.VOICE
                }

        # 5. College / Institute Extraction
        # Patterns: "at ABES Engineering College", "from Delhi University", "college is ..."
        college_match = re.search(
            r'(?:college(?:\s+is)?|institute(?:\s+is)?|university|at|from)\s+([A-Za-z0-9\.\s]+?(?:College|Institute|University|School|Academy|ABES)[A-Za-z0-9\.\s]*)',
            clean_text,
            re.IGNORECASE
        )
        if not college_match:
            college_match = re.search(
                r'([A-Za-z0-9\.\s]+?(?:College|Institute|University))\b',
                clean_text,
                re.IGNORECASE
            )

        if college_match:
            col_val = college_match.group(1).strip()
            col_val = re.sub(r'\b(se|me|hai|hoon)\b.*$', '', col_val, flags=re.IGNORECASE).strip()
            if len(col_val) > 4:
                extracted["college"] = {
                    "value": col_val,
                    "confidence": 0.91,
                    "source": FieldSource.VOICE
                }

        # 6. Mobile Phone Number
        # 10 digit Indian numbers starting with 6, 7, 8, 9
        phone_match = re.search(r'(?:mobile|phone|number|contact)?\s*[:=]?\s*([6-9]\d{9})\b', clean_text, re.IGNORECASE)
        if phone_match:
            extracted["mobile"] = {
                "value": phone_match.group(1),
                "confidence": 0.98,
                "source": FieldSource.VOICE
            }

        # 7. PIN Code
        # 6 digits starting with 1-9
        pin_match = re.search(r'(?:pin|pincode|pin code|postal code)\s*[:=]?\s*([1-9]\d{5})\b', clean_text, re.IGNORECASE)
        if pin_match:
            extracted["pincode"] = {
                "value": pin_match.group(1),
                "confidence": 0.97,
                "source": FieldSource.VOICE
            }

        # 8. Email
        email_match = re.search(r'\b([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)\b', clean_text)
        if email_match:
            extracted["email"] = {
                "value": email_match.group(1).lower(),
                "confidence": 0.99,
                "source": FieldSource.VOICE
            }

        # 9. Annual Family Income
        # Patterns: "income 180000", "1.8 lakh", "family income is 2 lakh", "वार्षिक आय 180000"
        income_match = re.search(
            r'(?:income|aay|parivarik aay|salary|annual income)\s*(?:is)?\s*[:=]?\s*(?:rs\.?|inr|rupees)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lakhs|lac|crore)?',
            clean_text,
            re.IGNORECASE
        )
        if not income_match:
            # Pattern: "1.8 lakh rupees income" or "180000 rupees"
            income_match = re.search(
                r'(\d+(?:\.\d+)?)\s*(lakh|lakhs|lac|crore|hazaar|thousand)?\s*(?:rupees|rs|inr)?\s*(?:income|aay)',
                clean_text,
                re.IGNORECASE
            )

        if income_match:
            val_str = income_match.group(1).replace(",", "")
            unit = (income_match.group(2) or "").lower()
            try:
                num = float(val_str)
                if unit in ["lakh", "lakhs", "lac"]:
                    num = int(num * 100000)
                elif unit in ["crore"]:
                    num = int(num * 10000000)
                elif unit in ["hazaar", "thousand"]:
                    num = int(num * 1000)
                else:
                    num = int(num)
                extracted["family_income"] = {
                    "value": f"₹{num:,}",
                    "confidence": 0.94,
                    "source": FieldSource.VOICE
                }
            except Exception:
                pass

        # 10. Date of Birth
        # Patterns: "15 August 2003", "15/08/2003", "15-08-2003", "DOB is 2003-08-15"
        dob_match = re.search(
            r'(?:dob|date of birth|birthdate|janam tithi)\s*(?:is)?\s*[:=]?\s*(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})',
            clean_text,
            re.IGNORECASE
        )
        if not dob_match:
            # "15 August 2003"
            dob_match = re.search(
                r'(\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})',
                clean_text,
                re.IGNORECASE
            )
        if dob_match:
            extracted["dob"] = {
                "value": dob_match.group(1).strip(),
                "confidence": 0.95,
                "source": FieldSource.VOICE
            }

        # 11. State
        for st in INDIAN_STATES:
            if re.search(r'\b' + re.escape(st) + r'\b', clean_text, re.IGNORECASE):
                extracted["state"] = {
                    "value": "Uttar Pradesh" if st.upper() == "UP" else ("Madhya Pradesh" if st.upper() == "MP" else st),
                    "confidence": 0.92,
                    "source": FieldSource.VOICE
                }
                break

        # 12. Address
        # Patterns: "address is 124 Shanti Nagar", "address 124 Shanti Nagar"
        addr_match = re.search(
            r'(?:address|pata)(?:\s+is)?\s*[:=]?\s*([A-Za-z0-9\s,\.\-\#\/]+?)(?:\.|$|,?\s*(?:city|pin|state))',
            clean_text,
            re.IGNORECASE
        )
        if addr_match:
            addr_val = addr_match.group(1).strip()
            if len(addr_val) > 5 and not addr_val.lower().startswith("is"):
                extracted["address"] = {
                    "value": addr_val,
                    "confidence": 0.88,
                    "source": FieldSource.VOICE
                }

        return extracted

extraction_service = ExtractionService()
