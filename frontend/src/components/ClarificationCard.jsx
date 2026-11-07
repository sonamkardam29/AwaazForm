import React, { useState } from 'react';
import { 
  Volume2, 
  HelpCircle, 
  Mic, 
  Send, 
  Sparkles, 
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import { api } from '../services/api';

export default function ClarificationCard({ 
  clarification, 
  onAnswerSubmitted,
  isProcessing = false 
}) {
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!clarification) return null;

  // Speak the clarification question using Gnani Timbre TTS or browser SpeechSynthesis
  const handlePlayAudio = async () => {
    setIsPlayingAudio(true);
    const textToSpeak = `${clarification.question_hi} ${clarification.question_en}`;
    try {
      const res = await api.synthesizeSpeech(clarification.question_hi);
      if (res.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`);
        audio.onended = () => setIsPlayingAudio(false);
        audio.play();
      } else if ('speechSynthesis' in window) {
        // High quality browser fallback
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clarification.question_hi);
        utterance.lang = 'hi-IN';
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    } catch (err) {
      console.warn("TTS error, falling back to Web Speech:", err);
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(clarification.question_hi);
        utterance.lang = 'hi-IN';
        utterance.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!typedAnswer.trim()) return;
    onAnswerSubmitted(clarification.field_key, typedAnswer.trim());
    setTypedAnswer('');
  };

  const handleSelectOption = (val) => {
    onAnswerSubmitted(clarification.field_key, val);
  };

  return (
    <div className="rounded-2xl border-2 border-teal-500/60 bg-gradient-to-br from-teal-50/70 via-white to-blue-50/50 p-4 sm:p-5 shadow-md shadow-teal-500/5 animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-teal-600 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Clarification Needed: {clarification.field_label_en}
            </h4>
            <span className="text-[11px] text-teal-800 font-hindi font-medium">
              स्पष्टीकरण सहायक (Clarification Assistant)
            </span>
          </div>
        </div>

        {/* Audio Listen Button */}
        <button
          onClick={handlePlayAudio}
          disabled={isPlayingAudio}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-300 shadow-2xs transition-colors"
          title="Listen in Hindi via Timbre TTS"
        >
          <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce text-teal-600' : ''}`} />
          <span>{isPlayingAudio ? 'बोल रहा है...' : 'सुनें (Listen)'}</span>
        </button>
      </div>

      {/* Bilingual Question Display */}
      <div className="bg-white rounded-xl p-3.5 border border-teal-200/80 mb-3 shadow-2xs">
        <p className="text-sm font-bold text-slate-900 font-hindi leading-snug">
          {clarification.question_hi}
        </p>
        <p className="text-xs text-slate-600 mt-1">
          {clarification.question_en}
        </p>
      </div>

      {/* If options are provided (e.g. for conflict resolution or choice) */}
      {clarification.options && clarification.options.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {clarification.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(opt.value)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-teal-50 text-xs font-semibold text-slate-800 border border-slate-300 hover:border-teal-400 shadow-2xs transition-all"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Answer Input */}
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={typedAnswer}
          onChange={(e) => setTypedAnswer(e.target.value)}
          placeholder={`Type or answer for ${clarification.field_label_en}...`}
          className="flex-1 p-2.5 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-sm bg-white"
        />
        <button
          type="submit"
          disabled={!typedAnswer.trim() || isProcessing}
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
        >
          <span>Submit</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
