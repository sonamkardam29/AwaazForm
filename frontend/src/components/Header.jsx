import React from 'react';
import { Mic, Volume2, Shield, Trash2, HelpCircle, CheckCircle2, Sparkles, FileText } from 'lucide-react';

export default function Header({ 
  currentView, 
  setCurrentView, 
  sessionId, 
  onDeleteSession, 
  onStartTour,
  completionRate = 0,
  isLiveApi = false
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setCurrentView('landing')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-500/10 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">Awaaz<span className="text-teal-600">Form</span></span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold border border-teal-200">
                  आवाज़फ़ॉर्म
                </span>
              </div>
              <p className="text-[11px] text-slate-700 hidden sm:block">
                Voice-First Intelligent Form Assistant
              </p>
            </div>
          </div>

          {/* Nav / Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Live / Demo Mode Badge */}
            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${isLiveApi ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{isLiveApi ? 'Gnani AI Live' : 'Demo / Sandbox Mode'}</span>
            </div>

            {/* Guided Tour CTA */}
            <button
              onClick={onStartTour}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors shadow-sm"
              title="Launch step-by-step 9-stage interactive demonstration"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">Demo Walkthrough</span>
              <span className="sm:hidden">Tour</span>
            </button>

            {/* Navigation Buttons */}
            {sessionId && (
              <>
                <button
                  onClick={() => setCurrentView('form')}
                  className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    currentView === 'form' 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Smart Form</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                    {completionRate}%
                  </span>
                </button>

                {/* Delete Session Privacy Control */}
                <button
                  onClick={onDeleteSession}
                  className="inline-flex items-center space-x-1 p-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition-colors"
                  title="Privacy: Permanently delete current session and temporary files"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden lg:inline">Delete Session</span>
                </button>
              </>
            )}

            {!sessionId && (
              <button
                onClick={() => setCurrentView('form-select')}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm"
              >
                <span>Fill a Form</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
