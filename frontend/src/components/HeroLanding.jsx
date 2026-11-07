import React from 'react';
import { 
  Mic, 
  Sparkles, 
  ShieldCheck, 
  FileCheck2, 
  ArrowRight, 
  CheckCircle, 
  Volume2, 
  AlertTriangle, 
  Lock, 
  Languages, 
  FileSpreadsheet,
  GraduationCap,
  Users
} from 'lucide-react';

export default function HeroLanding({ onStartForm, onStartTour }) {
  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Section */}
      <section className="relative pt-12 pb-16 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.teal.50),white)] opacity-70" />
        
        <div className="max-w-5xl mx-auto px-4 text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Voice-First Accessibility for Digital India</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
            Speak in your language. <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-teal-700 to-teal-500">
              Complete your form with confidence.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-700 max-w-3xl mx-auto font-normal leading-relaxed mb-8">
            AwaazForm empowers students, parents, and citizens who struggle with complex English portals,
            confusing fields, and typing barriers. Speak naturally in <b>Hindi or Hinglish</b>, resolve conflicts
            intelligently, and generate certified PDF drafts.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartForm}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-7 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              <Mic className="w-5 h-5 text-teal-400" />
              <span>Start Filling Your Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartTour}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-300 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Interactive 9-Step Demo</span>
            </button>
          </div>

          {/* Quick trust metrics */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left max-w-3xl mx-auto pt-6 border-t border-slate-200">
            <div>
              <p className="text-2xl font-bold text-slate-900">100%</p>
              <p className="text-xs text-slate-700 font-medium">Explicit extraction (no AI hallucination)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-600">Hindi + Hinglish</p>
              <p className="text-xs text-slate-700 font-medium">Bilingual natural speech parser</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">Real-time Diff</p>
              <p className="text-xs text-slate-700 font-medium">Instant correction & source tracking</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-900">PDF Draft</p>
              <p className="text-xs text-slate-700 font-medium">Downloadable verified report</p>
            </div>
          </div>
        </div>

        {/* 2. Interactive Mockup Dashboard Preview */}
        <div className="max-w-5xl mx-auto mt-14 px-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-2xl shadow-slate-200/60">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs font-mono text-slate-600 ml-2">AwaazForm Live Session — Scholarship Portal</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-200">
                Interactive Assistant Active
              </span>
            </div>

            {/* Simulated Form UI preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Spoken Utterance Box */}
              <div className="md:col-span-1 bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 mb-2">
                    <Mic className="w-4 h-4 text-teal-600 animate-pulse" />
                    <span>Live Spoken Voice Input</span>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 leading-relaxed italic shadow-2xs">
                    "Mera naam Rahul Sharma hai, meri umar 21 saal hai, main Ghaziabad me rehta hoon..."
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-teal-700 font-medium">
                  ✓ Transcribed via Gnani Prisma Engine
                </div>
              </div>

              {/* Extracted Fields Preview */}
              <div className="md:col-span-2 grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Full Name</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1">Rahul Sharma</p>
                  <p className="text-[10px] text-slate-600">Source: Voice (Spoken)</p>
                </div>

                <div className="p-3 rounded-xl border border-amber-300 bg-amber-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Age</span>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">Needs Confirm</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1">
                    22 <span className="text-[10px] text-slate-600 line-through">21</span>
                  </p>
                  <p className="text-[10px] text-amber-800 font-medium">Corrected via: "Age 22, not 21"</p>
                </div>

                <div className="p-3 rounded-xl border border-rose-300 bg-rose-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Family Income</span>
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Doc Conflict</span>
                  </div>
                  <p className="text-sm font-semibold text-rose-900 mt-1">₹1,80,000 vs ₹2,50,000</p>
                  <p className="text-[10px] text-rose-700 font-medium">Click to resolve</p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Course & College</span>
                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">Extracted</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900 mt-1 truncate">B.Tech (CSE), ABES College</p>
                  <p className="text-[10px] text-slate-600">Ghaziabad, UP</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works (4 Clear Steps) */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How AwaazForm Works</h2>
          <p className="text-slate-700 mt-2 text-sm sm:text-base">
            From natural spoken words to a verified official draft in four transparent steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-lg mb-4">
              1
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Speak Naturally</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Speak in Hindi, Hinglish, or English. Say who you are, what course you are taking, and where you live without robotic commands.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-lg mb-4">
              2
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Smart Extraction</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              AwaazForm maps your speech directly to official fields. It extracts only explicit details and never invents or hallucinates answers.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
              3
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Verify & Resolve</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Upload sample documents (marksheet, certificate). If there's a discrepancy, AwaazForm highlights both values and lets you pick.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg mb-4">
              4
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Download PDF</h3>
            <p className="text-xs text-slate-700 leading-relaxed">
              Once required fields are confirmed, download a formatted draft PDF with audit trails, ready for submission to authorities.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Accessibility & Core Features */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 text-white">
              Accessibility-First Architecture
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-8">
              Designed specifically for first-generation internet users, students from rural communities, and anyone who feels intimidated by complex government and university web forms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Languages className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Code-Switching Support</h4>
              <p className="text-xs text-slate-300">
                Smoothly handles natural colloquial mixtures of Hindi and English words without breaking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Volume2 className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Spoken Clarifications</h4>
              <p className="text-xs text-slate-300">
                Gnani Timbre TTS speaks back questions in Hindi, explaining exactly what is missing.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <FileCheck2 className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Never Silent Overwrites</h4>
              <p className="text-xs text-slate-300">
                Document data is never applied without showing you a comparison diff and asking for consent.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <ShieldCheck className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">No Real Gov Credentials</h4>
              <p className="text-xs text-slate-300">
                Operates safely with fictional test documents; does not ask for real Aadhaar OTP or bank pins.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <Lock className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Complete Privacy Wipe</h4>
              <p className="text-xs text-slate-300">
                One-click 'Delete Session' erases all transcribed speech and temporary uploaded files.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <CheckCircle className="w-6 h-6 text-teal-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Color-Coded Trust</h4>
              <p className="text-xs text-slate-300">
                Green (Verified), Yellow (Unconfirmed), Red (Invalid), Grey (Not provided). Always transparent.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Supported Forms Section */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Available Form Templates</h2>
        <p className="text-slate-700 text-sm mb-8">Extensible modular schema ready for any state, central, or institutional application.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div 
            onClick={onStartForm}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 shadow-sm hover:shadow-md transition-all cursor-pointer text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">Primary Demo</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Scholarship Application</h3>
            <p className="text-xs text-slate-700 mt-1">
              Higher education merit-cum-means scholarship with personal, academic, institution, and family income verification.
            </p>
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-700 mt-4 group-hover:translate-x-1 transition-transform">
              <span>Start this form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          <div 
            onClick={onStartForm}
            className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer text-left group"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md">General Profile</span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">Basic Personal Information</h3>
            <p className="text-xs text-slate-700 mt-1">
              Standard citizen profile form capturing legal name, date of birth, age, residential address, mobile, and PIN code.
            </p>
            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-900 mt-4 group-hover:translate-x-1 transition-transform">
              <span>Start this form</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
