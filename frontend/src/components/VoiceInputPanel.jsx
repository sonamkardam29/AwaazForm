import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  Send, 
  Sparkles, 
  Edit3, 
  Volume2, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  Layers
} from 'lucide-react';
import { api } from '../services/api';

export default function VoiceInputPanel({ 
  sessionId, 
  onTranscriptSubmitted, 
  isProcessing = false 
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [transcriptionInfo, setTranscriptionInfo] = useState(null);
  const [presets, setPresets] = useState({});
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  // Load presets on mount
  useEffect(() => {
    api.getVoicePresets().then(res => {
      if (res && res.presets) {
        setPresets(res.presets);
      }
    }).catch(err => console.error("Error loading presets:", err));
  }, []);

  // Timer for recording duration
  useEffect(() => {
    if (isRecording) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Start Voice Recording via Web Audio API MediaRecorder
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
        await handleAudioUpload(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscriptionInfo(null);
    } catch (err) {
      console.warn("Microphone access unavailable or denied. Falling back to preset demo speech simulation:", err);
      // Demo simulated recording fallback
      simulateVoiceRecording();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const simulateVoiceRecording = () => {
    setIsRecording(true);
    setTimeout(async () => {
      setIsRecording(false);
      // Use default sample preset
      await handlePresetSelect("rahul_scholarship_hinglish");
    }, 2500);
  };

  const handleAudioUpload = async (audioBlob) => {
    setLoadingAudio(true);
    try {
      const res = await api.transcribeAudio(audioBlob);
      setTranscript(res.transcript || '');
      setTranscriptionInfo(res);
      setIsEditing(true); // Allow user to verify & edit transcript before submitting
    } catch (err) {
      console.error("Transcription error:", err);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handlePresetSelect = async (presetKey) => {
    setLoadingAudio(true);
    try {
      const res = await api.transcribePreset(presetKey);
      setTranscript(res.transcript || '');
      setTranscriptionInfo(res);
      setIsEditing(true);
    } catch (err) {
      console.error("Preset transcription failed:", err);
    } finally {
      setLoadingAudio(false);
    }
  };

  const handleSubmitTranscript = () => {
    if (!transcript.trim()) return;
    onTranscriptSubmitted(transcript.trim());
    setTranscript('');
    setTranscriptionInfo(null);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900">Voice Assistant</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              बोलकर भरें
            </span>
          </div>
          <p className="text-xs text-slate-700 mt-0.5">
            Speak in Hindi, Hinglish, or English. You can also edit the transcribed text before submitting.
          </p>
        </div>

        {/* Recording Status / Live Wave Indicator */}
        {isRecording && (
          <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <span>Recording... {recordingSeconds}s</span>
            <div className="flex items-end space-x-0.5 h-4 ml-1">
              <span className="w-1 bg-rose-500 rounded-full animate-soundwave-1" />
              <span className="w-1 bg-rose-500 rounded-full animate-soundwave-2" />
              <span className="w-1 bg-rose-500 rounded-full animate-soundwave-3" />
              <span className="w-1 bg-rose-500 rounded-full animate-soundwave-4" />
            </div>
          </div>
        )}
      </div>

      {/* Main Microphone Button Area */}
      <div className="flex flex-col items-center justify-center py-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={loadingAudio || isProcessing}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-slate-900 via-blue-900 to-teal-600 text-white shadow-xl shadow-teal-500/15 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all focus:outline-hidden disabled:opacity-50"
            title="Click to speak in Hindi or Hinglish"
          >
            <Mic className="w-8 h-8 text-teal-300 group-hover:scale-110 transition-transform" />
            <span className="absolute -bottom-7 text-[11px] font-semibold text-slate-600 group-hover:text-slate-900">
              Tap to Speak
            </span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-rose-600 text-white shadow-xl shadow-rose-600/30 hover:scale-105 active:scale-95 transition-all animate-pulse"
            title="Click to stop and transcribe"
          >
            <Square className="w-7 h-7 text-white fill-white" />
            <span className="absolute -bottom-7 text-[11px] font-semibold text-rose-700">
              Tap to Finish
            </span>
          </button>
        )}
      </div>

      {/* Processing or loading spinner */}
      {loadingAudio && (
        <div className="flex items-center justify-center space-x-2 py-4 text-xs font-semibold text-slate-600">
          <RefreshCw className="w-4 h-4 text-teal-600 animate-spin" />
          <span>Processing speech through Gnani Prisma engine...</span>
        </div>
      )}

      {/* Transcript Display & Editable Input */}
      {(transcript || isEditing) && !isRecording && (
        <div className="mt-8 pt-4 border-t border-slate-100 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800">
                Live Transcription (Review & Edit):
              </span>
            </div>

            {/* Provider notice badge */}
            {transcriptionInfo && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                transcriptionInfo.is_mock 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {transcriptionInfo.is_mock ? 'Demo Mode (Simulated Prisma v3)' : 'Gnani Prisma v3.0'}
              </span>
            )}
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Spoken words will appear here. You can also type or edit directly..."
              className="w-full p-3 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 text-sm text-slate-900 bg-slate-50/50 resize-none transition-all"
            />
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-[11px] text-slate-600">
                Tip: Speak naturally or say corrections like <i>"My age is 22, not 21"</i>
              </span>

              <button
                onClick={handleSubmitTranscript}
                disabled={!transcript.trim() || isProcessing}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <span>Process with AI</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Demo Sentence Presets (Crucial for test journey & walk-throughs!) */}
      <div className="mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center space-x-1">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Quick Test Voice Prompts (1-Click Test Scenarios)</span>
          </span>
          <span className="text-[10px] text-slate-600 font-mono">Hindi / Hinglish</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => handlePresetSelect("rahul_scholarship_hinglish")}
            className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs transition-colors group"
          >
            <p className="font-semibold text-slate-800 group-hover:text-teal-900">
              🗣️ 1. Initial Speech (Hinglish)
            </p>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              "Mera naam Rahul Sharma hai, meri umar 21 saal..."
            </p>
          </button>

          <button
            onClick={() => handlePresetSelect("rahul_age_correction")}
            className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs transition-colors group"
          >
            <p className="font-semibold text-slate-800 group-hover:text-teal-900">
              🔄 2. Voice Correction (Age)
            </p>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              "My age is 22, not 21."
            </p>
          </button>

          <button
            onClick={() => handlePresetSelect("rahul_city_correction")}
            className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs transition-colors group"
          >
            <p className="font-semibold text-slate-800 group-hover:text-teal-900">
              📍 3. Change City
            </p>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              "Change my city to Dadri."
            </p>
          </button>

          <button
            onClick={() => handlePresetSelect("rahul_phone_update")}
            className="text-left p-2.5 rounded-lg bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs transition-colors group"
          >
            <p className="font-semibold text-slate-800 group-hover:text-teal-900">
              📱 4. Mobile & PIN
            </p>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              "My mobile number is 9876543210 and PIN code is 201001."
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
