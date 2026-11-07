import React, { useState } from 'react';
import { 
  FileUp, 
  X, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  UploadCloud,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

export default function DocumentModal({ 
  isOpen, 
  onClose, 
  sessionId, 
  onDocumentProcessed 
}) {
  const [consentGiven, setConsentGiven] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [processResult, setProcessResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setErrorMsg('');
      setProcessResult(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) {
      setErrorMsg('Please select a file to upload.');
      return;
    }
    if (!consentGiven) {
      setErrorMsg('User consent is required before processing document.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      const res = await api.uploadDocument(sessionId, selectedFile, consentGiven);
      setProcessResult(res.result);
      if (onDocumentProcessed) onDocumentProcessed(res.state, res.result);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to process document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadSample = async (sampleId) => {
    if (!consentGiven) {
      setErrorMsg('User consent is required before processing document.');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    try {
      const res = await api.loadSampleDocument(sessionId, sampleId, consentGiven);
      setProcessResult(res.result);
      if (onDocumentProcessed) onDocumentProcessed(res.state, res.result);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load sample document');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <FileUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Document Intelligence & Cross-Verification
              </h3>
              <p className="text-xs text-slate-500 font-hindi">
                दस्तावेज़ सत्यापन और मिलान
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Privacy Consent Box (Module 11 requirement) */}
          <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs text-blue-900 space-y-2">
            <div className="flex items-center space-x-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Privacy & Document Handling Consent</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Documents are processed purely in-memory for field cross-checks during this session.
              No permanent storage occurs. Do not upload original government identity cards (Aadhaar/PAN).
            </p>
            <label className="flex items-center space-x-2 pt-1 cursor-pointer font-semibold">
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="rounded border-blue-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
              />
              <span className="text-xs text-slate-900">
                I give consent to parse this document for form field validation.
              </span>
            </label>
          </div>

          {/* 1-Click Pre-loaded Sample Documents */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                <span>Quick Test with Ready Sample Documents:</span>
              </span>
              <span className="text-[10px] text-teal-700 font-semibold">Demo Ready</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLoadSample("marksheet_rahul")}
                disabled={isUploading}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-teal-900">
                    📄 1. Marksheet Slip
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold">
                    Income Mismatch Demo
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Candidate: Rahul Sharma | College: ABES | Annual Family Income: <b>₹2,50,000</b>
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample("income_cert")}
                disabled={isUploading}
                className="p-3 text-left rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900">
                    📄 2. Revenue Income Cert
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-semibold">
                    Matching Income
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                  Tehsil Dadri | Annual Family Income: <b>₹1,80,000</b>
                </p>
              </button>
            </div>
          </div>

          {/* Or Custom Upload */}
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-800 mb-2 block">
              Or Upload Your Own Document (PDF, TXT, or Marks Sheet):
            </span>
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100/50 transition-colors">
              <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
              />
              {selectedFile && (
                <p className="text-xs text-teal-700 font-medium mt-2">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Results Display */}
          {processResult && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs space-y-2 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-teal-900 text-sm">
                  {processResult.message_en}
                </span>
                <span className="text-[11px] text-teal-700 font-hindi">
                  {processResult.message_hi}
                </span>
              </div>

              {processResult.conflicts && processResult.conflicts.length > 0 && (
                <div className="mt-2 p-3 bg-white rounded-xl border border-rose-200 space-y-2">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Discrepancy Detected (Never Silently Overwritten):</span>
                  </div>
                  {processResult.conflicts.map((conf, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-rose-50/50 border border-rose-100 text-[11px]">
                      <p className="font-semibold text-slate-900">{conf.field_label_en} ({conf.field_label_hi})</p>
                      <p className="text-slate-700">Your Spoken Input: <b>{conf.user_value}</b></p>
                      <p className="text-slate-700">Document Value: <b>{conf.document_value}</b></p>
                      <p className="text-rose-700 font-medium mt-1">Please review and select the correct value on the form.</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleUploadSubmit}
            disabled={!selectedFile || isUploading || !consentGiven}
            className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm disabled:opacity-50"
          >
            <span>{isUploading ? 'Parsing Document...' : 'Upload & Compare'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
