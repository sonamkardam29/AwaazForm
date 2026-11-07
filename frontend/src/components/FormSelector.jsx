import React from 'react';
import { GraduationCap, UserCheck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function FormSelector({ templates = [], onSelectTemplate, onBack }) {
  return (
    <div className="max-w-4xl mx-auto py-10 px-4 animate-fade-in">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
          फ़ॉर्म चुनें (Select Form)
        </span>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
          Choose Your Application Template
        </h2>
        <p className="text-sm text-slate-600 mt-2">
          Select the form you want to fill via voice assistance. More state and university forms can be added seamlessly.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tmpl) => (
          <div
            key={tmpl.id}
            onClick={() => onSelectTemplate(tmpl.id)}
            className="p-6 rounded-3xl bg-white border-2 border-slate-200 hover:border-teal-500 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-teal-700 text-white flex items-center justify-center shadow-md">
                  {tmpl.id === 'scholarship' ? (
                    <GraduationCap className="w-6 h-6 text-teal-300" />
                  ) : (
                    <UserCheck className="w-6 h-6 text-teal-300" />
                  )}
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {tmpl.fields?.length || 12} Fields
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                {tmpl.title_en}
              </h3>
              <p className="text-xs text-slate-500 font-hindi mt-0.5">
                {tmpl.title_hi}
              </p>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {tmpl.description_en}
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-700 group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                <span>Start Filling with Voice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                AF-{tmpl.id.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          ← Return to Home Overview
        </button>
      </div>
    </div>
  );
}
