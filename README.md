# AwaazForm (आवाज़फ़ॉर्म) – Voice-First Intelligent Form Assistant

> **"Speak in your language. Complete your form with confidence."**  
> *भारत का पहला सुलभ आवाज़-आधारित फ़ॉर्म सहायक*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20v4-38B2AC.svg)](https://tailwindcss.com/)
[![Gnani.ai](https://img.shields.io/badge/Voice%20AI-Gnani%20Prisma%20%26%20Timbre-4F46E5.svg)](https://gnani.ai/)
[![Tests](https://img.shields.io/badge/Tests-7%20Passed-emerald.svg)]()

---

## 🎯 Product Vision & Overview

Filling out online scholarship, admissions, and government forms in India is often an intimidating barrier for millions of citizens who struggle with English typing, confusing terminologies, and complex web layouts.

**AwaazForm** is an accessibility-first AI platform. It allows users to **speak naturally in Hindi or Hinglish**. It converts spoken dialogue into structured form fields, highlights missing or conflicting values, asks clarification questions in Hindi via text-to-speech, cross-references uploaded documents, and generates a verified downloadable PDF draft.

---

## 🚀 Key Features

1. **Bilingual Speech Input & Extraction (Gnani Prisma STT & Evon)**:
   - Natural Hindi and Hinglish speech parsing (e.g., *"Mera naam Rahul Sharma hai, meri umar 21 saal hai, main Ghaziabad me rehta hoon, aur ABES Engineering College se B.Tech Computer Science kar raha hoon"*).
   - Strict explicit extraction: never invents or hallucinates unmentioned data.

2. **Smart Color-Coded Form Interface**:
   - 🟢 **Green**: Verified by user or validated
   - 🟡 **Yellow**: Unclear or needs user confirmation (AI extractions start here)
   - 🔴 **Red**: Invalid format (e.g., wrong phone or PIN code)
   - ⚪ **Grey**: Empty / not provided

3. **Intelligent Voice Correction Engine**:
   - Handles natural corrections: *"My age is 22, not 21"*, *"Change my city to Dadri"*, or *"Remove my email address"*.
   - Preserves all other fields intact and displays real-time before/after diffs.
   - Detects ambiguity (e.g., ambiguous numbers) and asks clarification.

4. **Bilingual Clarification Assistant (Gnani Timbre TTS)**:
   - Identifies highest-priority missing or conflicting fields.
   - Generates friendly Hindi & English follow-up questions with audio playback.
   - Accepts both spoken or typed responses.

5. **Document Intelligence & Conflict Detection**:
   - Parses uploaded PDF / text marksheets or admission slips.
   - Compares document records against user speech.
   - Flags discrepancies (e.g., User income ₹1,80,000 vs Document ₹2,50,000).
   - **Never silently overwrites** user data; displays side-by-side comparison.

6. **Verification Barrier & ReportLab PDF Generation**:
   - Blocks PDF generation until all required fields are filled and confirmed.
   - Generates an official downloadable PDF with verification seal, audit timestamps, and non-government draft disclaimer.

7. **Privacy & Security First**:
   - Backend-only credentials (never exposed to client).
   - In-memory document validation with mandatory user consent.
   - One-click **Delete Session** to completely erase voice transcripts and temporary records.
   - Sensitive values masked in server logs.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide Icons, Canvas Confetti.
- **Backend**: Python 3.11+ / 3.13, FastAPI, Pydantic v2, SQLite, PyPDF, ReportLab.
- **Voice & Speech AI**:
  - **Gnani Prisma v3.0** (`https://api.vachana.ai/stt/v3`) for multi-lingual Indian speech-to-text.
  - **Gnani Timbre v2.5** (`https://api.vachana.ai/api/v1/tts/inference`) for Hindi text-to-speech.
  - Transparent fallback mode with clear UI labeling if API credentials are not provided.

---

## 📁 Project Directory Structure

```text
awaazform/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── schemas.py              # Pydantic schemas & field states
│   │   ├── routes/
│   │   │   ├── voice.py                # STT & TTS endpoints
│   │   │   ├── forms.py                # Session, extraction & correction APIs
│   │   │   ├── documents.py            # Upload & conflict resolution APIs
│   │   │   └── export.py               # PDF export endpoint
│   │   ├── services/
│   │   │   ├── extraction_service.py   # Hinglish/Hindi NLP parser
│   │   │   ├── correction_service.py   # Voice correction & diff tracking
│   │   │   ├── clarification_service.py# Clarification assistant & prompts
│   │   │   ├── gnani_service.py        # Prisma & Timbre integrations
│   │   │   ├── document_service.py     # Document parser & conflict checker
│   │   │   ├── pdf_service.py          # ReportLab PDF generator
│   │   │   └── storage_service.py      # SQLite session persistence
│   │   └── utils/
│   │       └── config.py               # Config & log masking
│   ├── tests/
│   │   └── test_awaazform.py           # Backend unit test suite
│   ├── main.py                         # FastAPI server entrypoint
│   └── requirements.txt                # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx              # Navigation & session delete
│   │   │   ├── HeroLanding.jsx         # Landing page & dashboard preview
│   │   │   ├── FormSelector.jsx        # Scholarship & Personal form templates
│   │   │   ├── VoiceInputPanel.jsx     # Microphone & editable transcript
│   │   │   ├── SmartForm.jsx           # Color-coded live form & diffs
│   │   │   ├── ClarificationCard.jsx   # Bilingual prompt & TTS playback
│   │   │   ├── DocumentModal.jsx       # Document upload & sample loader
│   │   │   ├── FinalVerificationModal.jsx # Review & PDF export guard
│   │   │   └── DemoTourGuide.jsx       # 9-step interactive demo guide
│   │   ├── services/
│   │   │   └── api.js                  # Frontend API client
│   │   ├── App.jsx                     # Master state controller
│   │   ├── main.jsx                    # React mount
│   │   └── index.css                   # Tailwind v4 styles
│   ├── package.json
│   └── vite.config.js
├── sample_data/
│   ├── sample_marksheet_rahul.txt      # Marksheet with intentional income mismatch
│   ├── sample_marksheet_rahul.pdf
│   ├── sample_income_cert.txt          # Revenue Income Certificate
│   └── sample_income_cert.pdf
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚡ Installation & Execution Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env` in the root or set environment variables:
```bash
# If you have Gnani API keys, provide them:
GNANI_API_KEY=your_gnani_key_here
GNANI_PRISMA_URL=https://api.vachana.ai/stt/v3
GNANI_TIMBRE_URL=https://api.vachana.ai/api/v1/tts/inference
```
*(If no API key is provided, AwaazForm runs seamlessly in clearly labelled Demo / Sandbox Mode with built-in realistic Hinglish speech simulation).*

---

### 3. Start Backend Server

Open a terminal:
```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
Backend will start at: `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).

---

### 4. Start Frontend Client

Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Frontend will start at: `http://localhost:5173`. Open this URL in your web browser.

---

## 🧪 Running Automated Tests

Run the backend test suite:
```bash
cd backend
python -m pytest tests/test_awaazform.py -v
```

All 7 test suites will execute:
- `test_extraction_english`: Verifies explicit field extraction from English speech.
- `test_extraction_hinglish`: Verifies Hindi/Hinglish speech understanding.
- `test_voice_correction_age_diff`: Verifies diff tracking (*"My age is 22, not 21"*).
- `test_voice_correction_city`: Verifies city replacement while preserving other fields.
- `test_voice_correction_remove_email`: Verifies field removal commands.
- `test_document_conflict_detection`: Verifies document income conflict flagging.
- `test_pdf_generation_content`: Verifies ReportLab PDF binary generation with disclaimer.

---

## 🎬 9-Step End-to-End Demo Walkthrough

AwaazForm features a built-in **"Demo Walkthrough"** widget (click the button in the header or bottom right):

1. **Select Scholarship Application**: Click *"Start Filling Your Form"* and choose Scholarship Application.
2. **Speak Hindi/Hinglish**: Click the microphone or select Preset 1:  
   *"Mera naam Rahul Sharma hai, meri umar 21 saal hai, main Ghaziabad me rehta hoon, aur ABES Engineering College se B.Tech Computer Science kar raha hoon."*
3. **Extract & Fill Fields**: See `full_name`, `age`, `city`, `course`, and `college` populate with yellow *"Needs Confirmation"* status.
4. **Clarification Assistant**: See the clarification card prompt in Hindi for missing details. Click *"सुनें (Listen)"* to hear the audio prompt via TTS.
5. **Voice Correction**: Speak or choose Preset 2: *"My age is 22, not 21."* Notice the real-time diff banner showing age updated from 21 to 22.
6. **Upload Sample Document**: Click *"Verify Document"*. Give consent and select *"📄 1. Marksheet Slip (Rahul Sharma)"*.
7. **Document Mismatch Detection**: Notice the conflict alert on `Annual Family Income` (User ₹1,80,000 vs Document ₹2,50,000). Click *"Keep Voice"* or *"Use Doc"*.
8. **Confirm Final Values**: Review all fields and click *"Confirm All Completed Fields"*. All turn green (Verified).
9. **Generate & Download PDF**: Click *"Review & PDF"* -> *"Download Verified PDF Draft"*. A formatted, certified draft PDF with application reference, timestamp, and legal disclaimer downloads instantly.

---

## 🛡️ Security & Ethical Guardrails

- **No Real PII Demanded**: Operates on fictional test identities (Rahul Sharma, ABES College).
- **Log Masking**: Mobile numbers and emails are automatically masked in logs (`98******10`).
- **Consent Gate**: Uploaded documents require explicit user consent before parsing.
- **Session Wipe**: The user can click *"Delete Session"* at any moment to destroy temporary SQLite entries and session context.
- **Draft Disclaimer**: Every generated PDF clearly states that it is a computer-assisted draft and not an official government filing until submitted through official state portals.
