import React, { useState } from 'react';
import { 
  FileCheck2, 
  X, 
  Download, 
  AlertCircle, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';

export default function FinalVerificationModal({ 
  isOpen, 
  onClose, 
  sessionId, 
  state, 
  onConfirmAll 
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  if (!isOpen || !state) return null;

  const fields = Object.values(state.fields || {});
  const missingRequired = fields.filter(f => f.is_required && (!f.value || f.status === 'empty'));
  const unverifiedFields = fields.filter(f => f.value && f.status !== 'verified');
  const conflictingFields = fields.filter(f => f.has_conflict);

  const canDownload = missingRequired.length === 0 && unverifiedFields.length === 0 && conflictingFields.length === 0;

  const handleDownloadPdf = async () => {
    if (!canDownload) return;
    setIsDownloading(true);
    setDownloadError('');
    try {
      // Trigger canvas confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Confetti fallback
      }

      // Download file via window location / anchor
      const downloadUrl = api.getExportPdfUrl(sessionId);
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.detail || "PDF generation blocked: please complete verification.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AwaazForm_Scholarship_${sessionId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setDownloadError(err.message || 'Error downloading PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Final Review & Verification
              </h3>
              <p className="text-xs text-slate-500 font-hindi">
                अंतिम समीक्षा और सत्यापन
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

        {/* Content Table & Warnings */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Status Checks / Blocker Banner */}
          {!canDownload ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center space-x-2 font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Verification Barrier Active (Cannot Generate PDF Yet)</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                {missingRequired.length > 0 && (
                  <li>
                    <b>{missingRequired.length} Missing Required Field(s):</b> {missingRequired.map(f => f.label_en).join(', ')}
                  </li>
                )}
                {unverifiedFields.length > 0 && (
                  <li>
                    <b>{unverifiedFields.length} Unconfirmed Field(s):</b> Needs your explicit confirmation before PDF lock.
                  </li>
                )}
                {conflictingFields.length > 0 && (
                  <li>
                    <b>{conflictingFields.length} Unresolved Document Conflict:</b> Please choose between voice vs document value.
                  </li>
                )}
              </ul>

              {missingRequired.length === 0 && unverifiedFields.length > 0 && (
                <div className="pt-2">
                  <button
                    onClick={onConfirmAll}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-2xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm All Completed Fields (1-Click)</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
              <div className="flex items-center space-x-2 font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>All Required Fields Completed & Verified! Ready for PDF download.</span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-800">
                100% Verified
              </span>
            </div>
          )}

          {/* Fields Review Table */}
          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold">
                  <th className="p-3">Field (विवरण)</th>
                  <th className="p-3">Value</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fields.map((f, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-3 font-semibold text-slate-800">
                      {f.label_en}
                      <span className="block text-[10px] text-slate-600 font-hindi font-normal">
                        {f.label_hi}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-900">
                      {f.value || <span className="text-slate-600 italic">Not provided</span>}
                    </td>
                    <td className="p-3 text-slate-600 capitalize">
                      {f.source || 'voice'}
                    </td>
                    <td className="p-3">
                      {f.status === 'verified' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          ✓ Verified
                        </span>
                      ) : f.status === 'needs_confirmation' ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold">
                          Needs Confirm
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px]">
                          Empty
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Disclaimer Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
            <b>Disclaimer:</b> The generated PDF is a certified draft prepared via voice assistance and user verification. It is not an official government submission until lodged on the official state portal.
          </div>

          {downloadError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{downloadError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Back to Editing
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={!canDownload || isDownloading}
            className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-teal-300" />
            <span>{isDownloading ? 'Generating PDF...' : 'Download Verified PDF Draft'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
