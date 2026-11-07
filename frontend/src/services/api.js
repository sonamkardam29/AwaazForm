const API_BASE = "http://localhost:8000";

export const api = {
  // Voice & STT
  async transcribeAudio(audioBlob, language = "indic-auto") {
    const formData = new FormData();
    if (audioBlob) {
      formData.append("audio_file", audioBlob, "user_speech.wav");
    }
    formData.append("language", language);
    const res = await fetch(`${API_BASE}/api/voice/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Transcription failed");
    return res.json();
  },

  async transcribePreset(presetKey) {
    const formData = new FormData();
    formData.append("preset_key", presetKey);
    const res = await fetch(`${API_BASE}/api/voice/transcribe`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) throw new Error("Preset transcription failed");
    return res.json();
  },

  async getVoicePresets() {
    const res = await fetch(`${API_BASE}/api/voice/presets`);
    return res.json();
  },

  async synthesizeSpeech(text, language = "hi-IN", voice = "Nalini") {
    const res = await fetch(`${API_BASE}/api/voice/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language, voice }),
    });
    return res.json();
  },

  // Forms & Session
  async getTemplates() {
    const res = await fetch(`${API_BASE}/api/forms/templates`);
    return res.json();
  },

  async createSession(formId = "scholarship") {
    const res = await fetch(`${API_BASE}/api/forms/session?form_id=${encodeURIComponent(formId)}`, {
      method: "POST",
    });
    return res.json();
  },

  async getSession(sessionId) {
    const res = await fetch(`${API_BASE}/api/forms/session/${encodeURIComponent(sessionId)}`);
    if (!res.ok) throw new Error("Session not found");
    return res.json();
  },

  async extractFields(sessionId, text, source = "voice") {
    const res = await fetch(`${API_BASE}/api/forms/extract`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, text, source }),
    });
    return res.json();
  },

  async correctFields(sessionId, text) {
    const res = await fetch(`${API_BASE}/api/forms/correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, text }),
    });
    return res.json();
  },

  async getClarification(sessionId) {
    const res = await fetch(`${API_BASE}/api/forms/clarify/${encodeURIComponent(sessionId)}`);
    return res.json();
  },

  async answerClarification(sessionId, fieldKey, answerText) {
    const res = await fetch(`${API_BASE}/api/forms/clarify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        field_key: fieldKey,
        answer_text: answerText,
      }),
    });
    return res.json();
  },

  async verifyField(sessionId, fieldKey, value = null, verified = true) {
    const res = await fetch(`${API_BASE}/api/forms/verify-field`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        field_key: fieldKey,
        value,
        verified,
      }),
    });
    return res.json();
  },

  async confirmAll(sessionId) {
    const res = await fetch(`${API_BASE}/api/forms/confirm-all/${encodeURIComponent(sessionId)}`, {
      method: "POST",
    });
    return res.json();
  },

  async deleteSession(sessionId) {
    const res = await fetch(`${API_BASE}/api/forms/session/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    });
    return res.json();
  },

  // Documents
  async uploadDocument(sessionId, file, consentGiven = true) {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("consent_given", consentGiven);
    formData.append("file", file);
    const res = await fetch(`${API_BASE}/api/documents/upload`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },

  async loadSampleDocument(sessionId, sampleId, consentGiven = true) {
    const formData = new FormData();
    formData.append("session_id", sessionId);
    formData.append("sample_id", sampleId);
    formData.append("consent_given", consentGiven);
    const res = await fetch(`${API_BASE}/api/documents/load-sample`, {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Loading sample failed");
    }
    return res.json();
  },

  async resolveConflict(sessionId, fieldKey, chosenValue, chosenSource) {
    const res = await fetch(`${API_BASE}/api/documents/resolve-conflict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        field_key: fieldKey,
        chosen_value: chosenValue,
        chosen_source: chosenSource,
      }),
    });
    return res.json();
  },

  // Export PDF
  getExportPdfUrl(sessionId) {
    return `${API_BASE}/api/export/pdf/${encodeURIComponent(sessionId)}`;
  },
};
