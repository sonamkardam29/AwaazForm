import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroLanding from './components/HeroLanding';
import FormSelector from './components/FormSelector';
import VoiceInputPanel from './components/VoiceInputPanel';
import SmartForm from './components/SmartForm';
import ClarificationCard from './components/ClarificationCard';
import DocumentModal from './components/DocumentModal';
import FinalVerificationModal from './components/FinalVerificationModal';
import DemoTourGuide, { DEMO_STEPS } from './components/DemoTourGuide';
import { api } from './services/api';
import { 
  FileUp, 
  FileCheck2, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Volume2, 
  RefreshCw,
  Trash2
} from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'form-select', 'form'
  const [templates, setTemplates] = useState([]);
  const [session, setSession] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastCorrection, setLastCorrection] = useState(null);
  
  // Modals
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  
  // Demo Tour State
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentTourStep, setCurrentTourStep] = useState(0);

  // Load templates on launch
  useEffect(() => {
    api.getTemplates().then(data => {
      if (data) setTemplates(data);
    }).catch(err => console.error("Failed to fetch templates:", err));
  }, []);

  // Calculate completion percentage
  const getCompletionRate = () => {
    if (!session || !session.fields) return 0;
    const fList = Object.values(session.fields);
    if (fList.length === 0) return 0;
    const verifiedCount = fList.filter(f => f.status === 'verified').length;
    return Math.round((verifiedCount / fList.length) * 100);
  };

  // Initialize a new form session
  const handleSelectTemplate = async (templateId) => {
    setIsProcessing(true);
    try {
      const state = await api.createSession(templateId);
      setSession(state);
      setCurrentView('form');
    } catch (err) {
      console.error("Error creating session:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Process User Speech or Edited Transcript
  const handleTranscriptSubmitted = async (text) => {
    if (!session) return;
    setIsProcessing(true);
    setLastCorrection(null);

    try {
      // Check if it's a correction utterance
      const lower = text.toLowerCase();
      const isCorrection = lower.includes("not ") || 
                           lower.includes("change ") || 
                           lower.includes("badal") || 
                           lower.includes("remove ") || 
                           lower.includes("hata do") || 
                           lower.includes("nhi") || 
                           lower.includes("nahi");

      if (isCorrection) {
        const res = await api.correctFields(session.session_id, text);
        setSession(res.state);
        setLastCorrection(res.result);
      } else {
        const res = await api.extractFields(session.session_id, text, 'voice');
        setSession(res.state);
      }
    } catch (err) {
      console.error("Error processing speech text:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Answer a Clarification Question
  const handleAnswerClarification = async (fieldKey, answerText) => {
    if (!session) return;
    setIsProcessing(true);
    try {
      const res = await api.answerClarification(session.session_id, fieldKey, answerText);
      setSession(res.state);
    } catch (err) {
      console.error("Error answering clarification:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Verify/Confirm or Edit a Field Value
  const handleVerifyField = async (fieldKey, value, verified = true) => {
    if (!session) return;
    try {
      const res = await api.verifyField(session.session_id, fieldKey, value, verified);
      setSession(res.state);
    } catch (err) {
      console.error("Error verifying field:", err);
    }
  };

  // Resolve a Conflict Between Voice vs Document
  const handleResolveConflict = async (fieldKey, chosenValue, chosenSource) => {
    if (!session) return;
    try {
      const res = await api.resolveConflict(session.session_id, fieldKey, chosenValue, chosenSource);
      setSession(res.state);
    } catch (err) {
      console.error("Error resolving conflict:", err);
    }
  };

  // 1-Click Confirm All Fields
  const handleConfirmAll = async () => {
    if (!session) return;
    try {
      const res = await api.confirmAll(session.session_id);
      setSession(res.state);
    } catch (err) {
      console.error("Error confirming all:", err);
    }
  };

  // Delete Session (Privacy Module 11)
  const handleDeleteSession = async () => {
    if (!session) return;
    if (window.confirm("Are you sure you want to permanently delete this session and all voice/document data?")) {
      try {
        await api.deleteSession(session.session_id);
        setSession(null);
        setCurrentView('landing');
        setLastCorrection(null);
      } catch (err) {
        console.error("Error deleting session:", err);
      }
    }
  };

  // Document Modal Callback
  const handleDocumentProcessed = (newState, result) => {
    setSession(newState);
  };

  // 9-Step Interactive Demo Tour Executor
  const handleRunDemoStep = async (stepIndex) => {
    setIsProcessing(true);
    try {
      switch (stepIndex) {
        case 0: // 1. Select Scholarship Form
          const s1 = await api.createSession("scholarship");
          setSession(s1);
          setCurrentView('form');
          break;

        case 1: // 2. Speak Sample Hinglish Sentence
          // Simulates speech through backend voice transcription preset
          const presetRes = await api.transcribePreset("rahul_scholarship_hinglish");
          // Proceed to fill
          const s2 = await api.extractFields(session ? session.session_id : (await api.createSession("scholarship")).session_id, presetRes.transcript, "voice");
          setSession(s2.state);
          break;

        case 2: // 3. Extract & Fill Fields
          // Re-affirm extraction
          if (session) {
            const s3 = await api.getSession(session.session_id);
            setSession(s3);
          }
          break;

        case 3: // 4. Highlight Missing Field (Clarification)
          // Clarification prompt already active on form
          if (session) {
            const clarRes = await api.getClarification(session.session_id);
            setSession({ ...session, clarification_pending: clarRes.clarification });
          }
          break;

        case 4: // 5. Voice Correction (Age: 22, not 21)
          if (session) {
            const corr = await api.correctFields(session.session_id, "My age is 22, not 21.");
            setSession(corr.state);
            setLastCorrection(corr.result);
          }
          break;

        case 5: // 6. Upload Sample Document
          setIsDocModalOpen(true);
          break;

        case 6: // 7. Detect & Highlight Mismatch
          // Load the marksheet with intentional discrepancy
          if (session) {
            const docRes = await api.loadSampleDocument(session.session_id, "marksheet_rahul", true);
            setSession(docRes.state);
            setIsDocModalOpen(false);
          }
          break;

        case 7: // 8. Confirm Final Values
          if (session) {
            // First fill remaining missing fields to satisfy required checks:
            await api.verifyField(session.session_id, "family_income", "₹1,80,000", true);
            await api.verifyField(session.session_id, "dob", "15-08-2003", true);
            await api.verifyField(session.session_id, "mobile", "9876543210", true);
            await api.verifyField(session.session_id, "address", "124 Shanti Nagar, Dadri", true);
            await api.verifyField(session.session_id, "state", "Uttar Pradesh", true);
            await api.verifyField(session.session_id, "pincode", "201001", true);
            // Now confirm all
            const confAll = await api.confirmAll(session.session_id);
            setSession(confAll.state);
          }
          break;

        case 8: // 9. Open PDF Modal & Download
          setIsVerifyModalOpen(true);
          break;

        default:
          break;
      }

      // Increment tour step or finish
      if (stepIndex < DEMO_STEPS.length - 1) {
        setCurrentTourStep(stepIndex + 1);
      }
    } catch (err) {
      console.error("Error executing demo step:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartTour = () => {
    setIsTourOpen(true);
    setCurrentTourStep(0);
  };

  const handleResetTour = () => {
    setCurrentTourStep(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Global Accessibility Header */}
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        sessionId={session ? session.session_id : null}
        onDeleteSession={handleDeleteSession}
        onStartTour={handleStartTour}
        completionRate={getCompletionRate()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* VIEW 1: LANDING PAGE */}
        {currentView === 'landing' && (
          <HeroLanding
            onStartForm={() => setCurrentView('form-select')}
            onStartTour={handleStartTour}
          />
        )}

        {/* VIEW 2: FORM SELECTION */}
        {currentView === 'form-select' && (
          <FormSelector
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onBack={() => setCurrentView('landing')}
          />
        )}

        {/* VIEW 3: SMART FORM & ASSISTANT */}
        {currentView === 'form' && session && (
          <div className="space-y-6 animate-fade-in pb-16">
            {/* Top Action Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    Active Application
                  </span>
                  <span className="text-xs text-slate-600 font-mono">
                    ID: {session.session_id.slice(0, 8)}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  {session.form_id === 'scholarship' ? 'Scholarship Application (छात्रवृत्ति आवेदन)' : 'Basic Personal Information'}
                </h2>
                <p className="text-xs text-slate-700">
                  Speak in Hindi/Hinglish to fill or correct fields. Cross-verify with sample documents before generating PDF.
                </p>
              </div>

              {/* Progress & Quick Action Buttons */}
              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                {/* Document Intelligence Trigger */}
                <button
                  onClick={() => setIsDocModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold border border-blue-200 transition-colors shadow-2xs"
                >
                  <FileUp className="w-4 h-4 text-blue-700" />
                  <span>Verify Document</span>
                </button>

                {/* Final Verification & PDF Trigger */}
                <button
                  onClick={() => setIsVerifyModalOpen(true)}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <FileCheck2 className="w-4 h-4 text-teal-300" />
                  <span>Review & PDF ({getCompletionRate()}%)</span>
                </button>
              </div>
            </div>

            {/* Layout Grid: Left Column = Voice & Clarification, Right Column = Smart Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Voice & Assistant Column (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                {/* 1. Voice Input Microphone Panel */}
                <VoiceInputPanel
                  sessionId={session.session_id}
                  onTranscriptSubmitted={handleTranscriptSubmitted}
                  isProcessing={isProcessing}
                />

                {/* 2. Clarification Assistant Card (if missing or unclear field exists) */}
                {session.clarification_pending && (
                  <ClarificationCard
                    clarification={session.clarification_pending}
                    onAnswerSubmitted={handleAnswerClarification}
                    isProcessing={isProcessing}
                  />
                )}
              </div>

              {/* Smart Form Display Column (7 Cols) */}
              <div className="lg:col-span-7">
                <SmartForm
                  fields={session.fields}
                  onVerifyField={handleVerifyField}
                  onResolveConflict={handleResolveConflict}
                  lastCorrection={lastCorrection}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Document Upload & Cross-Verification */}
      {session && (
        <DocumentModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          sessionId={session.session_id}
          onDocumentProcessed={handleDocumentProcessed}
        />
      )}

      {/* MODAL 2: Final Verification Review & PDF Generation */}
      {session && (
        <FinalVerificationModal
          isOpen={isVerifyModalOpen}
          onClose={() => setIsVerifyModalOpen(false)}
          sessionId={session.session_id}
          state={session}
          onConfirmAll={handleConfirmAll}
        />
      )}

      {/* 9-Step Interactive Guided Demo Walkthrough */}
      <DemoTourGuide
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        currentStepIndex={currentTourStep}
        onRunStep={handleRunDemoStep}
        onResetTour={handleResetTour}
      />
    </div>
  );
}
