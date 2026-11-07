import pytest
from app.services.extraction_service import extraction_service
from app.services.correction_service import correction_service
from app.services.storage_service import storage_service
from app.services.clarification_service import clarification_service
from app.services.document_service import document_service
from app.services.pdf_service import pdf_service
from app.models.schemas import FieldStatus, FieldSource

def test_extraction_english():
    text = "My name is Rahul Sharma, age 21, I live in Ghaziabad, I am pursuing B.Tech in Computer Science."
    extracted = extraction_service.extract_fields(text)
    
    assert "full_name" in extracted
    assert extracted["full_name"]["value"] == "Rahul Sharma"
    assert "age" in extracted
    assert extracted["age"]["value"] == "21"
    assert "city" in extracted
    assert extracted["city"]["value"] == "Ghaziabad"
    assert "course" in extracted
    assert "B.Tech" in extracted["course"]["value"]

def test_extraction_hinglish():
    text = "Mera naam Rahul Sharma hai, meri umar 21 saal hai, main Ghaziabad me rehta hoon, aur ABES Engineering College se B.Tech Computer Science kar raha hoon."
    extracted = extraction_service.extract_fields(text)
    
    assert extracted["full_name"]["value"] == "Rahul Sharma"
    assert extracted["age"]["value"] == "21"
    assert extracted["city"]["value"] == "Ghaziabad"
    assert "ABES" in extracted["college"]["value"]

def test_voice_correction_age_diff():
    session = storage_service.create_session("test-corr-session", "scholarship")
    # Pre-populate age 21
    session.fields["age"].value = "21"
    session.fields["age"].status = FieldStatus.NEEDS_CONFIRMATION
    
    res = correction_service.process_correction(session, "My age is 22, not 21.")
    assert res["success"] is True
    assert res["corrected_field"] == "age"
    assert res["previous_value"] == "21"
    assert res["new_value"] == "22"
    assert session.fields["age"].value == "22"

def test_voice_correction_city():
    session = storage_service.create_session("test-city-session", "scholarship")
    session.fields["city"].value = "Ghaziabad"
    
    res = correction_service.process_correction(session, "Change my city to Dadri.")
    assert res["success"] is True
    assert res["corrected_field"] == "city"
    assert res["previous_value"] == "Ghaziabad"
    assert res["new_value"] == "Dadri"
    assert session.fields["city"].value == "Dadri"

def test_voice_correction_remove_email():
    session = storage_service.create_session("test-email-session", "scholarship")
    session.fields["email"].value = "rahul@example.com"
    
    res = correction_service.process_correction(session, "Remove my email address")
    assert res["success"] is True
    assert res["action"] == "removed"
    assert session.fields["email"].value is None

def test_document_conflict_detection():
    session = storage_service.create_session("test-doc-session", "scholarship")
    session.fields["family_income"].value = "₹1,80,000"
    session.fields["family_income"].status = FieldStatus.VERIFIED
    
    doc_sample = b"""
    Student Name: Rahul Sharma
    Date of Birth: 15/08/2003
    College: ABES Engineering College
    Course: B.Tech in Computer Science
    Annual Family Income: Rs. 2,50,000
    """
    
    res = document_service.compare_and_apply_document(session, doc_sample, "test_doc.txt")
    assert res["success"] is True
    # Income conflict must be flagged
    assert session.fields["family_income"].has_conflict is True
    assert session.fields["family_income"].conflict_detail["document_value"] == "₹250,000"
    # Never overwrite silently: user value must still be ₹1,80,000
    assert session.fields["family_income"].value == "₹1,80,000"

def test_pdf_generation_content():
    session = storage_service.create_session("test-pdf-session", "scholarship")
    for f in session.fields.values():
        f.value = "Test Value"
        f.status = FieldStatus.VERIFIED
    
    pdf_bytes = pdf_service.generate_form_pdf(session, "Scholarship Application")
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")
