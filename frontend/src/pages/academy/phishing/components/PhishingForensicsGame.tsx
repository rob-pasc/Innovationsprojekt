import { useState, useEffect } from 'react';
import { usePhishingForensicsStore, getPhishingForensicsSnapshot } from '@/store/usePhishingForensicsStore';
import { useGameStore } from '@/store/useGameStore';
import type { GameResult } from '@/store/useGameStore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WheelOption {
  label: string;
  reason: string;
  pos: { x: number; y: number };
}

interface EvidenceItem {
  id: string;
  text: string;
}

interface WheelState {
  active: boolean;
  x: number;
  y: number;
  activeZoneId: string | null;
  shake: boolean;
  wrongBtnIndex: number | null;
}

interface ModalState {
  active: boolean;
  title: string;
  body: string;
  color: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TOTAL_CLUES = 5;

const WHEEL_OPTIONS: WheelOption[] = [
  { label: 'Fake-Domain',   reason: 'spoofed-domain',   pos: { x: 0,   y: -85 } },
  { label: 'Formatierung',  reason: 'formatting-error', pos: { x: 77,  y: -50 } },
  { label: 'Schad-Link',    reason: 'malicious-link',   pos: { x: 95,  y: 0   } },
  { label: 'Dringlichkeit', reason: 'urgency',          pos: { x: 77,  y: 50  } },
  { label: 'Allg. Anrede',  reason: 'generic-greeting', pos: { x: 0,   y: 85  } },
  { label: 'KI-Stil',       reason: 'ai-syntax',        pos: { x: -77, y: 50  } },
  { label: 'Logikfehler',   reason: 'logic-error',      pos: { x: -95, y: 0   } },
  { label: 'Datenabfrage',  reason: 'data-request',     pos: { x: -77, y: -50 } },
];

const EVIDENCE_LIST: EvidenceItem[] = [
  { id: 'spoofed-domain', text: 'Gefälschte Domain'   },
  { id: 'ai-syntax',      text: 'Unnatürlicher Stil'  },
  { id: 'malicious-link', text: 'Schädlicher Link'    },
  { id: 'logic-error',    text: 'Veraltetes Copyright'},
  { id: 'urgency',        text: 'Dringlichkeit'       },
];

// ── Suspicious Zone sub-component ─────────────────────────────────────────────

interface SuspiciousZoneProps {
  id: string;
  children: React.ReactNode;
  tooltipTitle: string;
  tooltipText: string;
  style?: React.CSSProperties;
  foundClues: string[];
  fadingTooltips: Set<string>;
  onZoneClick: (e: React.MouseEvent, id: string) => void;
}

function SuspiciousZone({ id, children, tooltipTitle, tooltipText, style, foundClues, fadingTooltips, onZoneClick }: SuspiciousZoneProps) {
  const isFound = foundClues.includes(id);
  const isFading = fadingTooltips.has(id);

  return (
    <span
      className={`dsg-zone ${isFound ? 'found' : ''}`}
      data-id={id}
      onClick={(e) => onZoneClick(e, id)}
      style={style}
    >
      {children}
      {isFound && (
        <span className={`dsg-tooltip ${isFading ? 'fade-out' : ''}`}>
          <span className="dsg-tooltip-tag">{tooltipTitle}</span>
          {tooltipText}
        </span>
      )}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  // Called when the user submits their verdict — makes the API call and
  // returns the backend result (including the real xpAwarded).
  onSubmit: (score: number, stateData: object) => Promise<GameResult>;
  // Called when the user dismisses the result modal — triggers navigation.
  onComplete: () => void;
}

export default function PhishingForensicsGame({ onSubmit, onComplete }: Props) {
  // ── Store — persistent game state ────────────────────────────────────────
  const {
    foundZoneIds, cluesFound, verdict,
    initGame, recordZoneAttempt, submitVerdict, completeGame, reset,
  } = usePhishingForensicsStore();

  const isSubmitting = useGameStore(s => s.isSubmitting);

  // ── Local — pure UI state (not worth persisting) ─────────────────────────
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [noVerdictError, setNoVerdictError] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ active: false, title: '', body: '', color: '' });

  const [wheelState, setWheelState] = useState<WheelState>({
    active: false, x: 0, y: 0,
    activeZoneId: null, shake: false, wrongBtnIndex: null,
  });

  const [fadingTooltips, setFadingTooltips] = useState<Set<string>>(new Set());

  // ── Init — resume if same game module, otherwise start fresh ────────────
  useEffect(() => {
    const gameModuleId = useGameStore.getState().gameModuleId;
    if (!gameModuleId) return;
    const existingId = usePhishingForensicsStore.getState().gameModuleId;
    if (existingId !== gameModuleId) {
      reset();
      initGame(gameModuleId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getArtificialityScore = () => {
    const percentage = Math.min(Math.round((cluesFound / TOTAL_CLUES) * 98), 98);
    let color = 'hsl(var(--success))';
    if (percentage > 70) color = 'hsl(var(--destructive))';
    else if (percentage > 40) color = 'hsl(var(--accent))';
    return { percentage, color };
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleZoneClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.target instanceof HTMLAnchorElement) e.preventDefault();
    if (foundZoneIds.includes(id)) return;
    setWheelState({ active: true, x: e.clientX, y: e.clientY, activeZoneId: id, shake: false, wrongBtnIndex: null });
  };

  const closeWheel = () => setWheelState(prev => ({ ...prev, active: false, activeZoneId: null }));

  const handleWheelOptionClick = (e: React.MouseEvent, selectedReason: string, index: number) => {
    e.stopPropagation();
    if (!wheelState.activeZoneId) return;

    const isCorrect = selectedReason === wheelState.activeZoneId;
    recordZoneAttempt(wheelState.activeZoneId, selectedReason, isCorrect);

    if (isCorrect) {
      setTimeout(() => {
        setFadingTooltips(prev => { const next = new Set(prev); next.add(selectedReason); return next; });
      }, 5000);
      closeWheel();
    } else {
      setWheelState(prev => ({ ...prev, shake: true, wrongBtnIndex: index }));
      setTimeout(() => setWheelState(prev => ({ ...prev, shake: false, wrongBtnIndex: null })), 400);
    }
  };

  const handleSubmit = async () => {
    if (!verdict) {
      setNoVerdictError(true);
      setTimeout(() => setNoVerdictError(false), 2500);
      return;
    }

    const score = verdict === 'SCHÄDLICH' ? Math.round((cluesFound / TOTAL_CLUES) * 100) : 0;

    // Mark complete in sessionStorage (sets completedAt), then snapshot for stateData
    completeGame(score, 0);
    const stateData = getPhishingForensicsSnapshot();

    // API call — XP is calculated exclusively on the backend
    const result = await onSubmit(score, stateData);
    if (!result) return; // error is surfaced via store.error; don't open modal

    // Open modal with the real xpAwarded from the backend
    let newModal: ModalState = { active: true, title: '', body: '', color: '' };
    if (verdict === 'SCHÄDLICH') {
      newModal.title = 'FALL GELÖST';
      newModal.color = 'hsl(var(--success))';
      newModal.body = cluesFound === TOTAL_CLUES
        ? `Perfekte Punktzahl! Sie haben alle <strong>${TOTAL_CLUES}</strong> Hinweise gefunden.<br><br><strong>Verdient: +${result.xpAwarded} XP</strong>`
        : `Gute Arbeit! Sie haben die Bedrohung erkannt, aber <strong>${TOTAL_CLUES - cluesFound}</strong> Hinweise übersehen.<br><br>Trefferquote: ${score}%<br><strong>Verdient: +${result.xpAwarded} XP</strong>`;
    } else {
      newModal.title = 'SICHERHEITSVERLETZUNG';
      newModal.color = 'hsl(var(--destructive))';
      newModal.body = 'Sie haben eine bösartige E-Mail als sicher eingestuft. Die Ransomware wurde ausgeführt.<br><br><strong>Verdiente XP: 0</strong>';
    }
    setModalState(newModal);
  };

  useEffect(() => {
    const handleClickOutside = () => { if (wheelState.active) closeWheel(); };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [wheelState.active]);

  const scoreData = getArtificialityScore();
  const zoneProps = { foundClues: foundZoneIds, fadingTooltips, onZoneClick: handleZoneClick };

  // ── Scoped CSS ────────────────────────────────────────────────────────────
  const scopedCSS = `
    .dsg-zone { position: relative; border-bottom: 2px dashed transparent; cursor: cell; transition: all 0.2s; padding: 0 2px; display: inline-block; }
    div.dsg-zone { display: inline-block; }
    .dsg-zone:hover { background-color: hsl(var(--accent) / 0.15); border-bottom-color: hsl(var(--accent) / 0.6); }
    .dsg-zone.found { background-color: hsl(var(--destructive) / 0.2); border: 1px solid hsl(var(--destructive)); border-radius: 3px; cursor: default; }
    .dsg-zone a { text-decoration: none; color: white; }
    @keyframes dsg-popIn { 0% { transform: translate(-50%,0) scale(0.9); opacity: 0; } 100% { transform: translate(-50%,0) scale(1); opacity: 1; } }
    @keyframes dsg-fadeOut { from { opacity: 1; pointer-events: auto; } to { opacity: 0; pointer-events: none; visibility: hidden; } }
    .dsg-zone.found .dsg-tooltip { display: block; animation: dsg-popIn 0.2s ease-out forwards; }
    .dsg-zone.found .dsg-tooltip.fade-out { animation: dsg-fadeOut 1s ease forwards; }
    .dsg-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: hsl(var(--card)); color: hsl(var(--card-foreground)); padding: 8px 12px; border-radius: var(--radius); font-size: 0.8rem; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 1px solid hsl(var(--accent)); z-index: 10; margin-bottom: 5px; transition: opacity 0.2s ease; display: none; }
    .dsg-tooltip:hover { opacity: 0.2; }
    .dsg-tooltip-tag { color: hsl(var(--accent)); font-weight: bold; display: block; margin-bottom: 2px; font-size: 0.7rem; text-transform: uppercase; }
    .dsg-hints-off .dsg-evidence-item:not(.dsg-checked) .dsg-evidence-text { filter: blur(5px); opacity: 0.4; user-select: none; transition: filter 0.3s ease, opacity 0.3s ease; }
    .dsg-slider { position: absolute; cursor: pointer; inset: 0; background-color: hsl(var(--muted)); transition: .4s; border-radius: 34px; }
    .dsg-slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .dsg-slider { background-color: hsl(var(--primary)); }
    input:checked + .dsg-slider:before { transform: translateX(14px); }
    .dsg-btn-safe { background: hsl(var(--card)); border: 2px solid hsl(var(--success)); color: hsl(var(--success)); opacity: 0.6; }
    .dsg-btn-safe.selected { background: hsl(var(--success)); color: hsl(var(--success-foreground)); opacity: 1; box-shadow: 0 0 15px hsl(var(--success) / 0.4); position: relative; }
    .dsg-btn-safe.selected::after { content: 'AUSGEWÄHLT'; position: absolute; top: -10px; right: -10px; background: white; color: hsl(var(--success)); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; }
    .dsg-btn-scam { background: hsl(var(--card)); border: 2px solid hsl(var(--destructive)); color: hsl(var(--destructive)); opacity: 0.6; }
    .dsg-btn-scam.selected { background: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); opacity: 1; box-shadow: 0 0 15px hsl(var(--destructive) / 0.4); position: relative; }
    .dsg-btn-scam.selected::after { content: 'AUSGEWÄHLT'; position: absolute; top: -10px; right: -10px; background: white; color: hsl(var(--destructive)); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; }
    .dsg-wheel { position: fixed; width: 240px; height: 240px; transform: translate(-50%,-50%) scale(0); z-index: 999; pointer-events: none; opacity: 0; transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.2s ease; }
    .dsg-wheel.active { transform: translate(-50%,-50%) scale(1); opacity: 1; pointer-events: all; }
    @keyframes dsg-shake { 0%,100% { transform: translate(-50%,-50%) translateX(0); } 25%,75% { transform: translate(-50%,-50%) translateX(-8px); } 50% { transform: translate(-50%,-50%) translateX(8px); } }
    .dsg-wheel.shake { animation: dsg-shake 0.4s ease-in-out; }
    .dsg-wheel-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 44px; height: 44px; background: hsl(var(--background)); border: 2px solid hsl(var(--primary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: hsl(var(--muted-foreground)); box-shadow: 0 0 15px hsl(var(--primary) / 0.4); cursor: pointer; z-index: 2; }
    .dsg-wheel-center:hover { color: hsl(var(--foreground)); background: hsl(var(--card)); }
    .dsg-wheel-btn { position: absolute; width: 90px; padding: 6px 8px; background: hsl(var(--card)); border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); font-size: 0.7rem; font-weight: bold; border-radius: 20px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: all 0.2s; text-align: center; white-space: nowrap; top: 50%; left: 50%; margin-top: -15px; margin-left: -45px; }
    .dsg-wheel-btn:hover { background: hsl(var(--primary)); border-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); z-index: 10; }
    .dsg-wheel-btn.wrong { background: hsl(var(--destructive)); border-color: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); }
    @media (max-width: 1200px) { .dsg-grid { grid-template-columns: 0 1fr 320px !important; } }
  `;

  return (
    <div className="dark bg-background text-foreground h-screen flex flex-col overflow-hidden relative" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <style>{scopedCSS}</style>

      {/* ── 2-Column Grid ── */}
      <div
        className="dsg-grid grid flex-1 overflow-hidden"
        style={{ gridTemplateColumns: '1fr 320px', gap: '1px', backgroundColor: 'hsl(var(--border))' }}
      >
        {/* Center: Active Case */}
        <main className="bg-background p-5 overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <div>
              <p className="text-xs text-muted-foreground mb-1">AKTUELLES ASSIGNMENT</p>
              <h2 className="text-2xl font-bold text-foreground">Fall #4092: "Dringende Rechnung"</h2>
            </div>
            <div className="bg-destructive/20 text-destructive px-3 py-1 rounded text-xs font-bold border border-destructive/40">
              Potenzielles Phishing
            </div>
          </div>

          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Beweismittel A: E-Mail Verlauf</p>

          <div className="bg-card rounded-[var(--radius)] border border-border mb-8 overflow-hidden">
            <div className="px-5 py-2.5 border-b border-border flex justify-between items-center text-sm text-muted-foreground bg-muted/40">
              <span>Outlook_Viewer_v2.exe</span>
              <span>Bedrohungsstufe: Unbekannt</span>
            </div>

            <div className="p-8 min-h-[250px]" style={{ fontFamily: 'Arial, sans-serif', background: '#e2e8f0', color: '#1e293b' }}>
              <div className="mb-5 pb-4 border-b border-[#cbd5e1]">
                <div className="flex mb-2 text-sm">
                  <span className="w-20 font-bold text-[#64748b]">Von:</span>
                  <SuspiciousZone id="spoofed-domain" tooltipTitle="GEFÄLSCHTE DOMAIN" tooltipText="Falsch geschriebenes 'PayPal' (Großes I statt kleinem l)" {...zoneProps}>
                    account-security@paypaI-support.net
                  </SuspiciousZone>
                </div>
                <div className="flex mb-2 text-sm">
                  <span className="w-20 font-bold text-[#64748b]">Betreff:</span>
                  <span className="font-bold">HANDLUNGSBEDARF: Unautorisierter Zugriff erkannt</span>
                </div>
              </div>

              <p className="mb-4">Sehr geehrter Kunde,</p>
              <p className="mb-4">
                Wir haben verdächtige Aktivitäten auf Ihrem Firmenkonto festgestellt. Um eine dauerhafte Sperrung zu verhindern, müssen Sie{' '}
                <SuspiciousZone id="ai-syntax" tooltipTitle="KI-STIL" tooltipText='Unnatürliche Formulierung ("das Notwendige veranlassen")' {...zoneProps}>
                  bitte das Notwendige veranlassen.
                </SuspiciousZone>
                {' '}Bitte machen Sie dies{' '}
                <SuspiciousZone id="urgency" tooltipTitle="DRINGLICHKEIT" tooltipText="Typisches Druckmittel: Kurze Frist soll Panik erzeugen." {...zoneProps}>
                  innerhalb von 24 Stunden.
                </SuspiciousZone>
              </p>
              <p className="mb-4">Bitte verifizieren Sie Ihre Identität über das sichere Portal unten:</p>
              <SuspiciousZone
                id="malicious-link"
                tooltipTitle="SCHÄDLICHER LINK"
                tooltipText="Linkziel maskiert. Führt zu 'papyal-verify.com'"
                style={{ background: '#3b82f6', color: 'white', padding: '10px 20px', borderRadius: '4px', marginBottom: '20px', fontWeight: 'bold', display: 'inline-block' }}
                {...zoneProps}
              >
                <a href="http://paypaI-verify.com" onClick={(e) => e.preventDefault()}>Jetzt Identität Verifizieren</a>
              </SuspiciousZone>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Security Team<br />
                Global Operations<br />
                <SuspiciousZone id="logic-error" tooltipTitle="LOGIKFEHLER" tooltipText="Veraltetes Copyright-Datum (Aktuelles Jahr ist 2025)" {...zoneProps}>
                  Copyright 2022
                </SuspiciousZone>
              </p>
            </div>
          </div>
        </main>

        {/* Right: Evidence & Verdict */}
        <aside className="bg-card border-l border-border p-5 overflow-y-auto">
          <h3 className="text-base font-semibold text-foreground mb-5">Untersuchungsbericht</h3>

          <div className="bg-foreground/[0.03] rounded-[var(--radius)] p-4 mb-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Gesammelte Beweise ({cluesFound}/{TOTAL_CLUES})
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Hinweise</span>
                <label className="relative inline-block w-8 h-[18px]">
                  <input type="checkbox" className="opacity-0 w-0 h-0" checked={hintsEnabled} onChange={(e) => setHintsEnabled(e.target.checked)} />
                  <span className="dsg-slider absolute" />
                </label>
              </div>
            </div>

            <ul className={hintsEnabled ? '' : 'dsg-hints-off'}>
              {EVIDENCE_LIST.map(item => {
                const isChecked = foundZoneIds.includes(item.id);
                return (
                  <li key={item.id} className={`dsg-evidence-item flex items-center gap-2.5 py-2 border-b border-border last:border-b-0 text-sm transition-all ${isChecked ? 'dsg-checked text-foreground' : 'text-muted-foreground'}`}>
                    <span className={`dsg-check w-4 h-4 flex items-center justify-center font-bold rounded-full border text-[0.7rem] flex-shrink-0 transition-all ${isChecked ? 'bg-[hsl(var(--success))] border-[hsl(var(--success))] text-white' : 'border-muted-foreground/40'}`}>
                      ✓
                    </span>
                    <span className="dsg-evidence-text">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-foreground/[0.03] rounded-[var(--radius)] p-4 mb-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Kontext-Analyse</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-foreground">KI-Wahrscheinlichkeit</span>
              <span className="font-bold text-sm" style={{ color: scoreData.color }}>{scoreData.percentage}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded mt-2 overflow-hidden">
              <div className="h-full rounded transition-all duration-300" style={{ width: `${scoreData.percentage}%`, background: scoreData.color }} />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Endgültiges Urteil</p>
            <p className="text-xs text-muted-foreground mb-2.5">
              Wählen Sie die entsprechende Klassifizierung, um Fall #4092 abzuschließen.
            </p>
            <div className="flex gap-2.5 mt-2.5">
              <button className={`dsg-btn-safe flex-1 py-3 rounded-[var(--radius)] font-bold cursor-pointer transition-all ${verdict === 'LEGITIM' ? 'selected' : ''}`} onClick={() => submitVerdict('LEGITIM', false)}>
                LEGITIM
              </button>
              <button className={`dsg-btn-scam flex-1 py-3 rounded-[var(--radius)] font-bold cursor-pointer transition-all ${verdict === 'SCHÄDLICH' ? 'selected' : ''}`} onClick={() => submitVerdict('SCHÄDLICH', true)}>
                SCHÄDLICH
              </button>
            </div>
            {noVerdictError && (
              <p className="text-destructive text-xs mt-2 text-center">Bitte wählen Sie zuerst ein Urteil.</p>
            )}
            <button
              className="w-full mt-4 py-3 rounded-[var(--radius)] font-bold text-primary-foreground border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'hsl(var(--primary))', boxShadow: '0 4px 10px hsl(var(--primary) / 0.3)' }}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Wird gesendet…' : 'AN ZENTRALE SENDEN'}
            </button>
          </div>
        </aside>
      </div>

      {/* ── Radial Context Wheel ── */}
      <div
        className={`dsg-wheel ${wheelState.active ? 'active' : ''} ${wheelState.shake ? 'shake' : ''}`}
        style={{ top: wheelState.y, left: wheelState.x }}
      >
        {WHEEL_OPTIONS.map((opt, index) => (
          <button
            key={opt.reason}
            className={`dsg-wheel-btn ${wheelState.wrongBtnIndex === index ? 'wrong' : ''}`}
            onClick={(e) => handleWheelOptionClick(e, opt.reason, index)}
            style={{ transform: `translate(${opt.pos.x}px, ${opt.pos.y}px)` }}
          >
            {opt.label}
          </button>
        ))}
        <div className="dsg-wheel-center" onClick={(e) => { e.stopPropagation(); closeWheel(); }}>✖</div>
      </div>

      {/* ── Result Modal ── */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${modalState.active ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ background: 'hsl(var(--background) / 0.9)' }}
      >
        <div
          className={`bg-card border border-border rounded-[var(--radius)] p-8 max-w-[400px] w-[90%] text-center shadow-2xl transition-transform duration-300 ${modalState.active ? 'translate-y-0' : 'translate-y-5'}`}
        >
          <h2 className="text-2xl font-bold mb-2.5" style={{ color: modalState.color }}>{modalState.title}</h2>
          <div className="text-muted-foreground mb-6 leading-relaxed text-sm" dangerouslySetInnerHTML={{ __html: modalState.body }} />
          <button
            className="w-full py-2.5 px-5 rounded-[var(--radius)] font-bold text-primary-foreground border-none cursor-pointer text-base hover:opacity-90 transition-opacity"
            style={{ background: 'hsl(var(--primary))' }}
            onClick={() => {
              setModalState(prev => ({ ...prev, active: false }));
              onComplete();
            }}
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>
  );
}
