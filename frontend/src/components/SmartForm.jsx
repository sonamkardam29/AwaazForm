import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Clock, 
  Edit2, 
  Check, 
  X, 
  FileText, 
  Mic, 
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

export default function SmartForm({ 
  fields = {}, 
  onVerifyField, 
  onResolveConflict,
  lastCorrection = null 
}) {
  const [editingKey, setEditingKey] = useState(null);
  const [tempValue, setTempValue] = useState('');

  const handleStartEdit = (key, currentVal) => {
    setEditingKey(key);
    setTempValue(currentVal || '');
  };

  const handleSaveEdit = (key) => {
    onVerifyField(key, tempValue, true);
    setEditingKey(null);
  };

  const handleCancelEdit = () => {
    setEditingKey(null);
    setTempValue('');
  };

  // Determine styling based on field status
  const getStatusBadge = (field) => {
    if (field.has_conflict) {
      return {
        border: 'border-rose-400 bg-rose-50/40 ring-1 ring-rose-200',
        badge: 'bg-rose-100 text-rose-800 border-rose-200',
        label: 'Conflict Detected',
        icon: AlertTriangle
      };
    }

    switch (field.status) {
      case 'verified':
        return {
          border: 'border-emerald-300 bg-emerald-50/30',
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          label: 'Verified',
          icon: CheckCircle2
        };
      case 'needs_confirmation':
        return {
          border: 'border-amber-300 bg-amber-50/30',
          badge: 'bg-amber-100 text-amber-800 border-amber-200',
          label: 'Needs Confirmation',
          icon: Clock
        };
      case 'invalid':
        return {
          border: 'border-rose-300 bg-rose-50/30',
          badge: 'bg-rose-100 text-rose-800 border-rose-200',
          label: 'Invalid Format',
          icon: AlertCircle
        };
      case 'empty':
      default:
        return {
          border: 'border-slate-200 bg-white opacity-85',
          badge: 'bg-slate-100 text-slate-600 border-slate-200',
          label: 'Not Provided',
          icon: HelpCircle
        };
    }
  };

  const getSourcePill = (source) => {
    switch (source) {
      case 'voice':
        return <span className="inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 font-medium border border-teal-200"><span>🎙️ Voice</span></span>;
      case 'document':
        return <span className="inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200"><span>📄 Document</span></span>;
      case 'correction':
        return <span className="inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 font-medium border border-purple-200"><span>🔄 Corrected</span></span>;
      case 'manual':
        return <span className="inline-flex items-center space-x-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200"><span>✏️ Manual</span></span>;
      default:
        return null;
    }
  };

  const fieldList = Object.values(fields);

  return (
    <div className="space-y-4">
      {/* Visual State Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs">
        <span className="font-bold text-slate-700">Visual Status:</span>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Green: Verified</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-600">Yellow: Needs Confirmation</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-600">Red: Invalid</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-600">Grey: Not Provided</span>
          </div>
        </div>
      </div>

      {/* Real-time Diff / Correction Notification Banner */}
      {lastCorrection && lastCorrection.success && (
        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs flex items-center justify-between animate-fade-in shadow-xs">
          <div className="flex items-center space-x-2.5">
            <span className="p-1 rounded-md bg-purple-200 text-purple-800">
              <Check className="w-4 h-4" />
            </span>
            <div>
              <p className="font-bold text-purple-900">
                {lastCorrection.message_en}
              </p>
              <p className="text-[11px] text-purple-700 font-hindi">
                {lastCorrection.message_hi}
              </p>
            </div>
          </div>
          {lastCorrection.previous_value && (
            <div className="text-right text-[11px] font-mono text-purple-800 hidden sm:block">
              <span className="line-through text-slate-400 mr-2">{lastCorrection.previous_value}</span>
              <span className="font-bold text-emerald-600">→ {lastCorrection.new_value}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Grid of Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fieldList.map((field) => {
          const statusConfig = getStatusBadge(field);
          const StatusIcon = statusConfig.icon;
          const isCurrentEditing = editingKey === field.key;

          return (
            <div
              key={field.key}
              className={`relative rounded-2xl border p-4 transition-all duration-200 ${statusConfig.border} shadow-2xs hover:shadow-xs`}
            >
              {/* Header: Label, Required badge, Status badge */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-900 text-sm">
                      {field.label_en}
                    </span>
                    {field.is_required && (
                      <span className="text-[10px] text-red-500 font-bold" title="Required field">*</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-hindi">
                    {field.label_hi}
                  </p>
                </div>

                <div className="flex items-center space-x-1.5">
                  {getSourcePill(field.source)}
                  <span className={`inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusConfig.badge}`}>
                    <StatusIcon className="w-3 h-3" />
                    <span>{statusConfig.label}</span>
                  </span>
                </div>
              </div>

              {/* Conflict Callout Box if present */}
              {field.has_conflict && field.conflict_detail && (
                <div className="my-2.5 p-2.5 rounded-xl bg-white border border-rose-300 shadow-2xs">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-700 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Information Discrepancy Found</span>
                  </div>
                  <p className="text-[11px] text-slate-700 mb-2">
                    Spoken value: <b>{field.conflict_detail.user_value}</b> vs Document: <b>{field.conflict_detail.document_value}</b>
                  </p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onResolveConflict(field.key, field.conflict_detail.user_value, 'voice')}
                      className="px-2.5 py-1 rounded bg-teal-50 hover:bg-teal-100 text-teal-800 text-[11px] font-semibold border border-teal-200 transition-colors"
                    >
                      Keep Voice ({field.conflict_detail.user_value})
                    </button>
                    <button
                      onClick={() => onResolveConflict(field.key, field.conflict_detail.document_value, 'document')}
                      className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-800 text-[11px] font-semibold border border-blue-200 transition-colors"
                    >
                      Use Doc ({field.conflict_detail.document_value})
                    </button>
                  </div>
                </div>
              )}

              {/* Field Value Display or In-place Editor */}
              {!isCurrentEditing ? (
                <div className="flex items-center justify-between pt-1">
                  <div>
                    {field.value ? (
                      <p className="text-base font-semibold text-slate-900 tracking-tight">
                        {field.value}
                        {field.previous_value && field.status === 'needs_confirmation' && (
                          <span className="text-xs font-normal text-slate-600 line-through ml-2">
                            (was: {field.previous_value})
                          </span>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm italic text-slate-400">
                        Not provided yet (speak to fill)
                      </p>
                    )}
                  </div>

                  {/* Field Actions */}
                  <div className="flex items-center space-x-1">
                    {field.value && field.status !== 'verified' && (
                      <button
                        onClick={() => onVerifyField(field.key, field.value, true)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                        title="Confirm & verify this value"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Confirm</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleStartEdit(field.key, field.value)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit manually"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={tempValue}
                    onChange={(e) => setTempValue(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-teal-500 ring-2 ring-teal-100 text-sm bg-white"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(field.key)}
                    className="p-2 rounded-lg bg-teal-600 text-white hover:bg-teal-700"
                    title="Save"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
