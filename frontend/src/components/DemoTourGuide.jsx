import React from 'react';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  RotateCcw,
  Volume2
} from 'lucide-react';

export const DEMO_STEPS = [
  {
    step: 1,
    title: "1. Select Scholarship Application",
    description: "Initialize the official Higher Education Scholarship Application template.",
    actionLabel: "Select Scholarship Form"
  },
  {
    step: 2,
    title: "2. Speak Hindi / Hinglish Sentence",
    description: "Simulate speech input: 'Mera naam Rahul Sharma hai, meri umar 21 saal hai, main Ghaziabad me rehta hoon, aur ABES Engineering College se B.Tech Computer Science kar raha hoon.'",
    actionLabel: "Speak Sample Sentence"
  },
  {
    step: 3,
    title: "3. Extract & Fill Fields",
    description: "AI extracts full_name, age, city, course, and college into structured JSON without hallucination.",
    actionLabel: "Extract Fields"
  },
  {
    step: 4,
    title: "4. Clarify Missing Information",
    description: "Clarification assistant identifies missing Annual Family Income and prompts the user in bilingual Hindi.",
    actionLabel: "Show Clarification Prompt"
  },
  {
    step: 5,
    title: "5. Voice Correction Engine",
    description: "User speaks: 'My age is 22, not 21.' AwaazForm updates only the age field and shows the previous vs updated diff.",
    actionLabel: "Trigger Age Correction"
  },
  {
    step: 6,
    title: "6. Upload Sample Document",
    description: "Upload sample admission marksheet slip to cross-verify student academic and financial records.",
    actionLabel: "Upload Sample Marksheet"
  },
  {
    step: 7,
    title: "7. Document Mismatch Detection",
    description: "Document states Income: ₹2,50,000 while user provided ₹1,80,000. System highlights discrepancy and requests confirmation.",
    actionLabel: "Detect & Highlight Mismatch"
  },
  {
    step: 8,
    title: "8. Confirm Final Values",
    description: "Review all required fields and user-verify all values to lift the verification barrier.",
    actionLabel: "Confirm All Fields"
  },
  {
    step: 9,
    title: "9. Generate & Download PDF",
    description: "Generate the official verified application draft with ReportLab and download the PDF.",
    actionLabel: "Open PDF Download Modal"
  }
];

export default function DemoTourGuide({ 
  isOpen, 
  onClose, 
  currentStepIndex, 
  onRunStep, 
  onResetTour 
}) {
  if (!isOpen) return null;

  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0];
  const progressPercent = Math.round(((currentStepIndex + 1) / DEMO_STEPS.length) * 100);

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-teal-500/80 p-5 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-teal-600 text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Interactive 9-Step Demo Walkthrough
            </h4>
            <span className="text-[10px] text-teal-700 font-medium">
              Step {currentStepIndex + 1} of {DEMO_STEPS.length} ({progressPercent}%)
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-3 overflow-hidden">
        <div 
          className="bg-gradient-to-r from-teal-500 to-blue-600 h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Detail */}
      <div className="space-y-1.5 mb-4">
        <h5 className="text-sm font-bold text-slate-900">
          {currentStep.title}
        </h5>
        <p className="text-xs text-slate-600 leading-relaxed">
          {currentStep.description}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <button
          onClick={onResetTour}
          className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Restart Tour</span>
        </button>

        <button
          onClick={() => onRunStep(currentStepIndex)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-102"
        >
          <span>{currentStep.actionLabel}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
