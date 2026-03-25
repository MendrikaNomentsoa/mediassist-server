import { useState } from "react";
import api from "../services/api";

const TRIAGE_CONFIG = {
  urgent: {
    label: "⚠ Urgence",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.3)",
  },
  modere: {
    label: "⚡ Modéré",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.3)",
  },
  leger: {
    label: "✓ Léger",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.3)",
  },
};

export default function DiagnoseForm() {
  const [form, setForm] = useState({
    symptoms: "",
    age: "",
    gender: "homme",
    langue: "fr",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.post("/diagnose", {
        ...form,
        age: parseInt(form.age, 10),
      });
      setResult(res.data.data);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Une erreur est survenue. Veuillez réessayer.";
      setError(msg);
    }

    setLoading(false);
  };

  const triage = result ? TRIAGE_CONFIG[result.triage] ?? TRIAGE_CONFIG.leger : null;
  const charCount = form.symptoms.length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .medi-root {
          min-height: 100vh;
          background: #0d0f14;
          background-image:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(16,185,129,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 80% 80%, rgba(99,102,241,0.07) 0%, transparent 50%);
          font-family: 'DM Sans', sans-serif;
          color: #e8eaf0;
          padding: 48px 16px 80px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .medi-container {
          width: 100%;
          max-width: 580px;
        }

        /* ── Header ── */
        .medi-header {
          text-align: center;
          margin-bottom: 40px;
          animation: fadeDown 0.6s ease both;
        }

        .medi-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          border-radius: 100px;
          padding: 4px 14px;
          font-size: 11px;
          font-weight: 500;
          color: #10b981;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        .medi-badge::before {
          content: '';
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        .medi-title {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(2rem, 6vw, 2.8rem);
          font-weight: 400;
          color: #f0f2f8;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .medi-title em {
          font-style: italic;
          color: #10b981;
        }

        .medi-subtitle {
          margin-top: 10px;
          font-size: 14px;
          color: #6b7280;
          font-weight: 300;
          line-height: 1.5;
        }

        /* ── Card ── */
        .medi-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 32px;
          backdrop-filter: blur(12px);
          animation: fadeUp 0.6s 0.1s ease both;
        }

        /* ── Fields ── */
        .medi-field {
          margin-bottom: 22px;
        }

        .medi-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .medi-textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          color: #e8eaf0;
          resize: vertical;
          min-height: 120px;
          transition: border-color 0.2s, background 0.2s;
          outline: none;
          line-height: 1.6;
        }

        .medi-textarea::placeholder { color: #4b5563; }

        .medi-textarea:focus {
          border-color: rgba(16,185,129,0.4);
          background: rgba(16,185,129,0.04);
        }

        .medi-char-count {
          text-align: right;
          font-size: 11px;
          color: #4b5563;
          margin-top: 4px;
        }

        .medi-char-count.warn { color: #f59e0b; }

        .medi-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        .medi-input,
        .medi-select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 12px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: #e8eaf0;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          appearance: none;
          -webkit-appearance: none;
        }

        .medi-select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
          cursor: pointer;
        }

        .medi-select option {
          background: #1a1d26;
          color: #e8eaf0;
        }

        .medi-input:focus,
        .medi-select:focus {
          border-color: rgba(16,185,129,0.4);
          background: rgba(16,185,129,0.04);
        }

        .medi-input::placeholder { color: #4b5563; }

        /* ── Error ── */
        .medi-error {
          background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Submit ── */
        .medi-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #059669, #10b981);
          border: none;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          color: #fff;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.01em;
        }

        .medi-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .medi-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .medi-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        /* ── Result ── */
        .medi-result {
          margin-top: 28px;
          animation: fadeUp 0.5s ease both;
        }

        .medi-result-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .medi-result-title {
          font-family: 'Instrument Serif', serif;
          font-size: 1.2rem;
          font-weight: 400;
          color: #f0f2f8;
        }

        .medi-triage-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }

        .medi-resume {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 16px 18px;
          font-size: 14px;
          line-height: 1.7;
          color: #d1d5db;
          font-weight: 300;
          margin-bottom: 16px;
        }

        .medi-conseils-title {
          font-size: 12px;
          font-weight: 500;
          color: #9ca3af;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .medi-conseils {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .medi-conseil-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          padding: 12px 14px;
          font-size: 13.5px;
          color: #d1d5db;
          line-height: 1.5;
          font-weight: 300;
        }

        .medi-conseil-dot {
          flex-shrink: 0;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
          margin-top: 6px;
        }

        .medi-disclaimer {
          margin-top: 20px;
          font-size: 11px;
          color: #4b5563;
          text-align: center;
          line-height: 1.5;
        }

        /* ── Animations ── */
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        @media (max-width: 480px) {
          .medi-card { padding: 24px 18px; }
          .medi-row  { grid-template-columns: 1fr 1fr; }
          .medi-row .medi-field:last-child { grid-column: span 2; }
        }
      `}</style>

      <div className="medi-root">
        <div className="medi-container">

          {/* Header */}
          <div className="medi-header">
            <div className="medi-badge">Assistant médical IA</div>
            <h1 className="medi-title">
              Medi<em>Assist</em>
            </h1>
            <p className="medi-subtitle">
              Décrivez vos symptômes pour obtenir une analyse préliminaire<br />
              disponible en français et en malagasy.
            </p>
          </div>

          {/* Form Card */}
          <div className="medi-card">
            <form onSubmit={handleSubmit}>

              {/* Symptoms */}
              <div className="medi-field">
                <label className="medi-label" htmlFor="symptoms">
                  Symptômes
                </label>
                <textarea
                  id="symptoms"
                  name="symptoms"
                  className="medi-textarea"
                  placeholder="Ex : J'ai de la fièvre depuis 2 jours, des maux de tête et une toux sèche..."
                  value={form.symptoms}
                  onChange={handleChange}
                  required
                />
                <div className={`medi-char-count ${charCount > 900 ? "warn" : ""}`}>
                  {charCount} / 1000
                </div>
              </div>

              {/* Age / Gender / Langue */}
              <div className="medi-row">
                <div className="medi-field">
                  <label className="medi-label" htmlFor="age">Âge</label>
                  <input
                    id="age"
                    type="number"
                    name="age"
                    className="medi-input"
                    placeholder="Ex: 32"
                    value={form.age}
                    onChange={handleChange}
                    min="0"
                    max="120"
                    required
                  />
                </div>

                <div className="medi-field">
                  <label className="medi-label" htmlFor="gender">Genre</label>
                  <select
                    id="gender"
                    name="gender"
                    className="medi-select"
                    value={form.gender}
                    onChange={handleChange}
                  >
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="medi-field">
                  <label className="medi-label" htmlFor="langue">Langue</label>
                  <select
                    id="langue"
                    name="langue"
                    className="medi-select"
                    value={form.langue}
                    onChange={handleChange}
                  >
                    <option value="fr">Français</option>
                    <option value="mg">Malagasy</option>
                  </select>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="medi-error">
                  <span>⚠</span> {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="medi-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="medi-spinner" />
                    Analyse en cours…
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Analyser mes symptômes
                  </>
                )}
              </button>
            </form>

            {/* Result */}
            {result && triage && (
              <div className="medi-result">
                <div className="medi-result-header">
                  <span className="medi-result-title">Résultat de l'analyse</span>
                  <span
                    className="medi-triage-pill"
                    style={{
                      color: triage.color,
                      background: triage.bg,
                      border: `1px solid ${triage.border}`,
                    }}
                  >
                    {triage.label}
                  </span>
                </div>

                <p className="medi-resume">{result.resume}</p>

                {result.conseils?.length > 0 && (
                  <>
                    <p className="medi-conseils-title">Conseils</p>
                    <ul className="medi-conseils">
                      {result.conseils.map((c, i) => (
                        <li key={i} className="medi-conseil-item">
                          <span className="medi-conseil-dot" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                <p className="medi-disclaimer">
                  ⚕ Cette analyse est indicative et ne remplace pas un avis médical professionnel.<br />
                  En cas d'urgence, appelez le 15 ou consultez un médecin.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}