import { useState, useEffect } from 'react';

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
  onComplete: (score: number) => void;
}

export default function DetectiveStoryGame({ onComplete }: Props) {
  const [foundClues, setFoundClues] = useState<string[]>([]);
  const [hintsEnabled, setHintsEnabled] = useState(false);
  const [verdict, setVerdict] = useState<'safe' | 'scam' | null>(null);
  const [noVerdictError, setNoVerdictError] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({ active: false, title: '', body: '', color: '' });
  const [finalScore, setFinalScore] = useState(0);

  const [wheelState, setWheelState] = useState<WheelState>({
    active: false, x: 0, y: 0,
    activeZoneId: null, shake: false, wrongBtnIndex: null,
  });

  const [fadingTooltips, setFadingTooltips] = useState<Set<string>>(new Set());

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getArtificialityScore = () => {
    const percentage = Math.min(Math.round((foundClues.length / TOTAL_CLUES) * 98), 98);
    let color = 'hsl(var(--success))';
    if (percentage > 70) color = 'hsl(var(--destructive))';
    else if (percentage > 40) color = 'hsl(var(--accent))';
    return { percentage, color };
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleZoneClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (e.target instanceof HTMLAnchorElement) e.preventDefault();
    if (foundClues.includes(id)) return;
    setWheelState({ active: true, x: e.clientX, y: e.clientY, activeZoneId: id, shake: false, wrongBtnIndex: null });
  };

  const closeWheel = () => setWheelState(prev => ({ ...prev, active: false, activeZoneId: null }));

  const handleWheelOptionClick = (e: React.MouseEvent, selectedReason: string, index: number) => {
    e.stopPropagation();
    if (!wheelState.activeZoneId) return;

    if (selectedReason === wheelState.activeZoneId) {
      const newFoundClues = [...foundClues, wheelState.activeZoneId];
      setFoundClues(newFoundClues);
      setTimeout(() => {
        setFadingTooltips(prev => { const next = new Set(prev); next.add(selectedReason); return next; });
      }, 5000);
      closeWheel();
    } else {
      setWheelState(prev => ({ ...prev, shake: true, wrongBtnIndex: index }));
      setTimeout(() => setWheelState(prev => ({ ...prev, shake: false, wrongBtnIndex: null })), 400);
    }
  };

  const handleSubmit = () => {
    if (!verdict) {
      setNoVerdictError(true);
      setTimeout(() => setNoVerdictError(false), 2500);
      return;
    }

    const cluesCount = foundClues.length;
    const BASE_XP = 150;
    const XP_PER_CLUE = 40;
    const totalXP = BASE_XP + cluesCount * XP_PER_CLUE;
    const score = verdict === 'scam' ? Math.round((cluesCount / TOTAL_CLUES) * 100) : 0;
    setFinalScore(score);

    let newModal: ModalState = { active: true, title: '', body: '', color: '' };
    if (verdict === 'scam') {
      newModal.title = 'FALL GELÖST';
      newModal.color = 'hsl(var(--success))';
      newModal.body = cluesCount === TOTAL_CLUES
        ? `Perfekte Punktzahl! Sie haben alle <strong>${TOTAL_CLUES}</strong> Hinweise gefunden.<br><br>Basis-Belohnung: +${BASE_XP}<br>Hinweis-Bonus: +${cluesCount * XP_PER_CLUE}<br><strong>Gesamt verdient: +${totalXP} XP</strong>`
        : `Gute Arbeit! Sie haben die Bedrohung erkannt, aber <strong>${TOTAL_CLUES - cluesCount}</strong> Hinweise übersehen.<br><br>Basis-Belohnung: +${BASE_XP}<br>Hinweis-Bonus: +${cluesCount * XP_PER_CLUE}<br><strong>Gesamt verdient: +${totalXP} XP</strong>`;
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
  const zoneProps = { foundClues, fadingTooltips, onZoneClick: handleZoneClick };

  // ── Scoped CSS ────────────────────────────────────────────────────────────
  // Only rules that Tailwind cannot express: keyframes, pseudo-elements,
  // complex descendant selectors, and the absolute-positioned wheel/tooltip.
  const scopedCSS = `
    /* Suspicious zone hover & found states */
    .dsg-zone { position: relative; border-bottom: 2px dashed transparent; cursor: cell; transition: all 0.2s; padding: 0 2px; display: inline-block; }
    div.dsg-zone { display: inline-block; }
    .dsg-zone:hover { background-color: hsl(var(--accent) / 0.15); border-bottom-color: hsl(var(--accent) / 0.6); }
    .dsg-zone.found { background-color: hsl(var(--destructive) / 0.2); border: 1px solid hsl(var(--destructive)); border-radius: 3px; cursor: default; }
    .dsg-zone a { text-decoration: none; color: white; }

    /* Tooltip */
    @keyframes dsg-popIn { 0% { transform: translate(-50%,0) scale(0.9); opacity: 0; } 100% { transform: translate(-50%,0) scale(1); opacity: 1; } }
    @keyframes dsg-fadeOut { from { opacity: 1; pointer-events: auto; } to { opacity: 0; pointer-events: none; visibility: hidden; } }
    .dsg-zone.found .dsg-tooltip { display: block; animation: dsg-popIn 0.2s ease-out forwards; }
    .dsg-zone.found .dsg-tooltip.fade-out { animation: dsg-fadeOut 1s ease forwards; }
    .dsg-tooltip { position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%); background: hsl(var(--card)); color: hsl(var(--card-foreground)); padding: 8px 12px; border-radius: var(--radius); font-size: 0.8rem; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.4); border: 1px solid hsl(var(--accent)); z-index: 10; margin-bottom: 5px; transition: opacity 0.2s ease; display: none; }
    .dsg-tooltip:hover { opacity: 0.2; }
    .dsg-tooltip-tag { color: hsl(var(--accent)); font-weight: bold; display: block; margin-bottom: 2px; font-size: 0.7rem; text-transform: uppercase; }

    /* Evidence hints toggle (blur unfound items) */
    .dsg-hints-off .dsg-evidence-item:not(.dsg-checked) .dsg-evidence-text { filter: blur(5px); opacity: 0.4; user-select: none; transition: filter 0.3s ease, opacity 0.3s ease; }

    /* Toggle switch slider ::before */
    .dsg-slider { position: absolute; cursor: pointer; inset: 0; background-color: hsl(var(--muted)); transition: .4s; border-radius: 34px; }
    .dsg-slider:before { position: absolute; content: ""; height: 12px; width: 12px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
    input:checked + .dsg-slider { background-color: hsl(var(--primary)); }
    input:checked + .dsg-slider:before { transform: translateX(14px); }

    /* Verdict button selected states & ::after "AUSGEWÄHLT" badge */
    .dsg-btn-safe { background: hsl(var(--card)); border: 2px solid hsl(var(--success)); color: hsl(var(--success)); opacity: 0.6; }
    .dsg-btn-safe.selected { background: hsl(var(--success)); color: hsl(var(--success-foreground)); opacity: 1; box-shadow: 0 0 15px hsl(var(--success) / 0.4); position: relative; }
    .dsg-btn-safe.selected::after { content: 'AUSGEWÄHLT'; position: absolute; top: -10px; right: -10px; background: white; color: hsl(var(--success)); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; }
    .dsg-btn-scam { background: hsl(var(--card)); border: 2px solid hsl(var(--destructive)); color: hsl(var(--destructive)); opacity: 0.6; }
    .dsg-btn-scam.selected { background: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); opacity: 1; box-shadow: 0 0 15px hsl(var(--destructive) / 0.4); position: relative; }
    .dsg-btn-scam.selected::after { content: 'AUSGEWÄHLT'; position: absolute; top: -10px; right: -10px; background: white; color: hsl(var(--destructive)); font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; }

    /* Radial context wheel */
    .dsg-wheel { position: fixed; width: 240px; height: 240px; transform: translate(-50%,-50%) scale(0); z-index: 999; pointer-events: none; opacity: 0; transition: transform 0.2s cubic-bezier(0.175,0.885,0.32,1.275), opacity 0.2s ease; }
    .dsg-wheel.active { transform: translate(-50%,-50%) scale(1); opacity: 1; pointer-events: all; }
    @keyframes dsg-shake { 0%,100% { transform: translate(-50%,-50%) translateX(0); } 25%,75% { transform: translate(-50%,-50%) translateX(-8px); } 50% { transform: translate(-50%,-50%) translateX(8px); } }
    .dsg-wheel.shake { animation: dsg-shake 0.4s ease-in-out; }
    .dsg-wheel-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 44px; height: 44px; background: hsl(var(--background)); border: 2px solid hsl(var(--primary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: hsl(var(--muted-foreground)); box-shadow: 0 0 15px hsl(var(--primary) / 0.4); cursor: pointer; z-index: 2; }
    .dsg-wheel-center:hover { color: hsl(var(--foreground)); background: hsl(var(--card)); }
    .dsg-wheel-btn { position: absolute; width: 90px; padding: 6px 8px; background: hsl(var(--card)); border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); font-size: 0.7rem; font-weight: bold; border-radius: 20px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.5); transition: all 0.2s; text-align: center; white-space: nowrap; top: 50%; left: 50%; margin-top: -15px; margin-left: -45px; }
    .dsg-wheel-btn:hover { background: hsl(var(--primary)); border-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); z-index: 10; }
    .dsg-wheel-btn.wrong { background: hsl(var(--destructive)); border-color: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); }

    /* Responsive: collapse sidebar */
    @media (max-width: 1200px) { .dsg-grid { grid-template-columns: 0 1fr 320px !important; } }
  `;

  return (
    // Force dark mode tokens for the entire game widget
    <div className="dark bg-background text-foreground h-screen flex flex-col overflow-hidden relative" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
      <style>{scopedCSS}</style>

      {/* ── Header ── */}
      <header className="bg-card border-b border-border px-6 h-[70px] flex-shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5 font-bold text-lg tracking-[0.5px]">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-xl">🛡️</div>
          <div>Digital Defense <span className="text-muted-foreground font-normal">Agency</span></div>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-1.5 text-accent font-bold">🔥 12 Tage Serie</div>
          <div className="bg-muted px-3 py-1 rounded-full text-sm border border-border">
            Analyst: <span className="text-primary font-bold">Phishing</span>
          </div>
          <div className="flex flex-col w-[220px] gap-1">
            <div className="flex justify-between text-xs text-muted-foreground font-semibold">
              <span>Beweise gefunden</span>
              <span>{foundClues.length}/{TOTAL_CLUES}</span>
            </div>
            <div className="h-2 bg-muted rounded overflow-hidden">
              <div
                className="h-full rounded transition-all duration-300"
                style={{ width: `${(foundClues.length / TOTAL_CLUES) * 100}%`, background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary) / 0.7))' }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* ── 3-Column Grid ── */}
      <div
        className="dsg-grid grid flex-1 overflow-hidden"
        style={{ gridTemplateColumns: '240px 1fr 320px', gap: '1px', backgroundColor: 'hsl(var(--border))' }}
      >
        {/* Left: Toolkit Sidebar */}
        <aside className="bg-card p-5 overflow-y-auto">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Standard Werkzeuge</p>
          {[
            { icon: '🔍', label: 'Fall-Ermittlung', active: true },
            { icon: '📧', label: 'Header-Analyse', active: false },
          ].map(btn => (
            <button
              key={btn.label}
              className={`flex items-center gap-3 w-full p-3 rounded-[var(--radius)] border mb-2 text-left text-sm transition-all cursor-pointer
                ${btn.active
                  ? 'bg-primary/20 text-primary border-primary font-semibold'
                  : 'bg-transparent border-transparent text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/30'
                }`}
            >
              <span className="w-6 text-center">{btn.icon}</span>
              <span>{btn.label}</span>
            </button>
          ))}

          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-5 mb-3">Erweiterte Forensik</p>
          {['🧠 Logik-Check', '🌍 Rückwärtssuche', '🔬 Pixel-DeepScan'].map(item => {
            const [icon, ...rest] = item.split(' ');
            return (
              <button key={item} className="flex items-center gap-3 w-full p-3 rounded-[var(--radius)] border border-transparent mb-2 text-left text-sm text-muted-foreground hover:bg-primary/10 hover:text-foreground hover:border-primary/30 transition-all cursor-pointer bg-transparent">
                <span className="w-6 text-center">{icon}</span>
                <span>{rest.join(' ')}</span>
              </button>
            );
          })}

          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-5 mb-3">Gesperrt (Lvl 5+)</p>
          <button className="flex items-center gap-3 w-full p-3 rounded-[var(--radius)] border border-transparent mb-2 text-left text-sm text-muted-foreground opacity-50 cursor-not-allowed bg-transparent">
            <span className="w-6 text-center">🔒</span>
            <span>Audio-Wellenform</span>
          </button>
        </aside>

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

            {/* Email mockup — intentionally light to simulate a real email client */}
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

          {/* Evidence list */}
          <div className="bg-foreground/[0.03] rounded-[var(--radius)] p-4 mb-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Gesammelte Beweise ({foundClues.length}/{TOTAL_CLUES})
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
                const isChecked = foundClues.includes(item.id);
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

          {/* Artificiality score */}
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

          {/* Verdict */}
          <div className="mt-8">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Endgültiges Urteil</p>
            <p className="text-xs text-muted-foreground mb-2.5">
              Wählen Sie die entsprechende Klassifizierung, um Fall #4092 abzuschließen.
            </p>
            <div className="flex gap-2.5 mt-2.5">
              <button className={`dsg-btn-safe flex-1 py-3 rounded-[var(--radius)] font-bold cursor-pointer transition-all ${verdict === 'safe' ? 'selected' : ''}`} onClick={() => setVerdict('safe')}>
                LEGITIM
              </button>
              <button className={`dsg-btn-scam flex-1 py-3 rounded-[var(--radius)] font-bold cursor-pointer transition-all ${verdict === 'scam' ? 'selected' : ''}`} onClick={() => setVerdict('scam')}>
                SCHÄDLICH
              </button>
            </div>
            {noVerdictError && (
              <p className="text-destructive text-xs mt-2 text-center">Bitte wählen Sie zuerst ein Urteil.</p>
            )}
            <button
              className="w-full mt-4 py-3 rounded-[var(--radius)] font-bold text-primary-foreground border-none cursor-pointer transition-opacity hover:opacity-90"
              style={{ background: 'hsl(var(--primary))', boxShadow: '0 4px 10px hsl(var(--primary) / 0.3)' }}
              onClick={handleSubmit}
            >
              AN ZENTRALE SENDEN
            </button>
          </div>

          {/* Leaderboard */}
          <div className="mt-10 pt-5 border-t border-border">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">Abteilungs-Bestenliste</p>
            <div className="flex justify-between text-sm mt-2.5">
              <span className="text-foreground">1. Technik</span>
              <span style={{ color: 'hsl(var(--success))' }}>98% Sicher</span>
            </div>
            <div className="flex justify-between text-sm mt-2 opacity-70">
              <span>2. Vertrieb (Du)</span>
              <span className="text-accent">84% Sicher</span>
            </div>
            <div className="flex justify-between text-sm mt-2 opacity-50">
              <span>3. HR</span>
              <span className="text-muted-foreground">79% Sicher</span>
            </div>
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
            onClick={() => onComplete(finalScore)}
          >
            Weiter →
          </button>
        </div>
      </div>
    </div>
  );
}
