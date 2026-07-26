import React, { useState, useEffect } from 'react';
import { useAuditStore } from './store/auditStore';

export default function App() {
  const [step, setStep] = useState(1);
  const [viewMode, setViewMode] = useState<'flat' | '3d'>('3d');
  const store = useAuditStore();

  const is3D = viewMode === '3d';

  const [compName, setCompName] = useState(store.company.name);
  const [compEmail, setCompEmail] = useState(store.company.email);
  const [compContact, setCompContact] = useState(store.company.contactPerson);
  const [compSector, setCompSector] = useState(store.company.sector);
  const [compTools, setCompTools] = useState(store.company.toolsUsed.join(', '));

  const [wfName, setWfName] = useState('');
  const [wfHours, setWfHours] = useState('10');
  const [wfKeywords, setWfKeywords] = useState('');
  const [wfDesc, setWfDesc] = useState('');

  const [privLocs, setPrivLocs] = useState(store.privacy.dataLocations.join(', '));
  const [privRisks, setPrivRisks] = useState(store.privacy.privacyRisks);
  const [privCompliance, setPrivCompliance] = useState(store.privacy.avgComplianceLevel);

  const [emailError, setEmailError] = useState(false);

  // Keyboard Shortcuts Listener (Ctrl/Cmd + Shift + D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setViewMode(v => v === 'flat' ? '3d' : 'flat');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // JSON Vault Export & Import Functions
  const handleExportJSON = () => {
    const exportData = {
      company: store.company,
      workflows: store.workflows,
      privacy: store.privacy,
      components: store.components,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute("href", dataStr);
    anchor.setAttribute("download", `mf-labs-audit-${Date.now()}.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          
          // 1. Bedrijf Sync
          if (parsed.company) {
            store.setCompany(parsed.company);
            setCompName(parsed.company.name || '');
            setCompEmail(parsed.company.email || '');
            setCompContact(parsed.company.contactPerson || '');
            setCompSector(parsed.company.sector || '');
            setCompTools((parsed.company.toolsUsed || []).join(', '));
          }
          
          // 2. Workflows Sync (Verholpen bug: JSON data direct inladen)
          if (parsed.workflows && Array.isArray(parsed.workflows)) {
            store.setWorkflows(parsed.workflows);
          }

          // 3. Privacy Runner State Sync (Verholpen bug: lokale React state synct nu)
          if (parsed.privacy) {
            store.setPrivacy(parsed.privacy);
            setPrivLocs(parsed.privacy.dataLocations.join(', ') || '');
            setPrivRisks(parsed.privacy.privacyRisks || '');
            setPrivCompliance(parsed.privacy.avgComplianceLevel || 0);
          }
          
          // 4. Components Sync
          if (parsed.components) store.setComponents(parsed.components);
          
          alert('Audit sessie succesvol geïmporteerd!');
        } catch (err) {
          alert('Fout bij inladen JSON bestand.');
        }
      };
    }
  };

  // Conceptuele PDF Download handler
  const handleDownloadPDF = () => {
    alert("Conceptual Backend Call: Downloading PDF... (In real scenario: fetch('http://localhost:3000/api/generate-pdf'))");
  };

  const handleSaveStep2 = () => {
    if (!compName || !compEmail) {
      alert('Vul ten minste bedrijfsnaam en e-mailadres in.');
      return;
    }
    if (!compEmail.includes('@')) {
      setEmailError(true);
      return;
    }
    setEmailError(false);
    store.setCompany({
      name: compName,
      email: compEmail,
      contactPerson: compContact,
      sector: compSector,
      toolsUsed: compTools.split(',').map((s) => s.trim()).filter(Boolean)
    });
    setStep(3);
  };

  const handleAddWorkflow = () => {
    if (!wfName) {
      alert('Voer een procesnaam in.');
      return;
    }
    store.addWorkflow({
      id: Date.now().toString(),
      processName: wfName,
      timeSpentPerWeek: parseFloat(wfHours) || 0,
      keywords: wfKeywords,
      description: wfDesc
    });
    setWfName('');
    setWfKeywords('');
    setWfDesc('');
  };

  const runEngine = () => {
    if (store.workflows.length === 0) {
      alert('Voeg minimaal één workflow toe.');
      return;
    }

    store.setPrivacy({
      dataLocations: privLocs.split(',').map((s) => s.trim()).filter(Boolean),
      privacyRisks: privRisks,
      avgComplianceLevel: privCompliance
    });

    const corpus = [
      compName, compSector, compTools,
      ...store.workflows.map(w => `${w.processName} ${w.keywords} ${w.description}`),
      privRisks,
      privLocs // VERBETERING: privLocs toegevoegd aan corpus
    ].join(' ').toLowerCase();

    const rules = [
      { id: 'rule-invoice', triggers: ['factuur', 'invoice', 'betaling'], title: 'Factuur-Check Script', desc: 'Automatische controle van inkomende facturen.', tools: ['Mailbox Connector', 'OCR Engine'], base: 8 },
      { id: 'rule-mail', triggers: ['mail', 'inbox', 'klant'], title: 'Mail-Flow Agent', desc: 'Sorteert mails en verstuurt automatische opvolging.', tools: ['LLM Gateway', 'SMTP Broker'], base: 7 },
      { id: 'rule-onboarding', triggers: ['onboarding', 'medewerker', 'contract'], title: 'Onboarding Automator', desc: 'Zet automatisch accounts en documenten klaar.', tools: ['HRM API', 'Identity Provider'], base: 6 },
      { id: 'rule-gdpr', triggers: ['gdpr', 'privacy', 'google drive', 'onedrive'], title: 'Privacy Sentinel', desc: 'Monitort data locaties en privacy-risico\'s.', tools: ['Compliance API', 'Data Loss Prevention'], base: 5 } // VERBETERING: privLocs specifieke regel
    ];

    const matched = rules.filter(r => r.triggers.some(t => corpus.includes(t)));
    
    // VERBETERING: Flexibelere fallback logica
    const selected = matched.length > 0 ? matched : [
        { id: 'rule-gen-check', triggers: [], title: 'Algemeen Proces-Script', desc: 'Genereert een basis-script voor de proces-check.', tools: ['Mailbox Connector', 'OCR Engine'], base: 5 }
    ];

    const totalHours = store.workflows.reduce((sum, w) => sum + w.timeSpentPerWeek, 0);
    const timeFactor = Math.min(1 + totalHours / 10, 2.0);
    const riskFactor = privRisks.length > 5 ? 1.3 : 1.0;
    const locFactor = privLocs.length > 5 ? 1.1 : 1.0; // VERBETERING: privLocs meegewogen in impact

    const components = selected.map(c => {
      const impactScore = Math.min(Math.round(c.base * timeFactor * riskFactor * locFactor), 10); // VERBETERING: impactScore berekend
      return {
        id: c.id,
        title: c.title,
        description: c.desc,
        requiredTools: c.tools,
        impactScore,
        estimatedTimeSaveHours: Math.round(impactScore * 1.5),
        complexityLevel: (impactScore >= 8 ? 'Hoog' : impactScore >= 5 ? 'Middel' : 'Laag') as 'Hoog' | 'Middel' | 'Laag'
      };
    });

    store.setComponents(components);
    setStep(5);
  };

  const cardClass = is3D
    ? 'bg-white/95 backdrop-blur-md border-2 border-[#09090B] shadow-[8px_8px_0px_0px_#09090B] p-6 space-y-4'
    : 'bg-white border-2 border-[#09090B] p-6 space-y-4';

  const btnPrimary = is3D
    ? 'px-6 py-3 bg-[#FF3B00] text-white font-bold border-2 border-[#09090B] shadow-[6px_6px_0px_0px_#09090B] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2'
    : 'px-6 py-3 bg-[#FF5722] text-white font-bold border-2 border-[#09090B] hover:bg-black hover:text-white transition-all flex items-center gap-2';

  const inputClass = is3D
    ? 'w-full bg-white border-2 border-[#09090B] p-2 text-black outline-none focus:shadow-[4px_4px_0px_0px_#FF3B00] transition-all'
    : 'w-full bg-white border-2 border-[#09090B] p-2 text-black outline-none';

  return (
    <div className={`min-h-screen flex flex-col font-mono text-sm text-[#09090B] ${is3D ? 'bg-[#F1F3F6] bg-grid-pattern' : 'bg-[#F8FAFC]'}`}>
      <header className={`border-b-2 border-[#09090B] p-4 ${is3D ? 'bg-white/90 backdrop-blur-md shadow-[0_4px_0px_0px_#09090B]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-bold text-lg">// MF LABS AUDIT // {is3D ? 'SYSTEM.2050' : 'LIGHT SUITE'}</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJSON}
              className="px-2 py-1 border-2 border-[#09090B] bg-slate-100 text-xs font-bold hover:bg-slate-200"
              title="Exporteer huidige sessie als JSON"
            >
              [ EXPORT JSON ]
            </button>
            <label className="px-2 py-1 border-2 border-[#09090B] bg-slate-100 text-xs font-bold hover:bg-slate-200 cursor-pointer">
              [ IMPORT JSON ]
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            <button
              onClick={() => setViewMode(v => v === 'flat' ? '3d' : 'flat')}
              className={`px-3 py-1 border-2 border-[#09090B] font-bold text-xs ${is3D ? 'bg-[#FF3B00] text-white shadow-[3px_3px_0px_0px_#09090B]' : 'bg-black text-white'}`}
              title="Shortcut: Ctrl+Shift+D"
            >
              MODE: {is3D ? '3D NEO-BRUTALIST 2050' : '2D SWISS FLAT'}
            </button>
            <span className="text-xs font-bold">[ STAP 0{step}/05 ]</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-6 flex-1 space-y-6">
        <div className="flex justify-between items-center text-xs">
          <span>{is3D ? '[STATUS: ACTIVE_SESSION] ------------ [LOC: NL_BREDA_NODE] ------------ [SHORTCUT: Ctrl+Shift+D]' : 'SWISS BRUTALIST AUDIT ENGINE'}</span>
          <button onClick={() => store.resetAudit()} className="text-[#FF3B00] font-bold underline">[ RESET STATE ]</button>
        </div>

        {step === 1 && (
          <div className={cardClass}>
            {is3D && (
              <div className="text-[10px] font-mono tracking-widest text-slate-500 border-b border-slate-200 pb-2 flex justify-between">
                <span>INDEX PLATE #01 — INTRO [SYS_ID: 884-AX]</span>
                <span className="bg-slate-100 px-1.5 py-0.5 border border-[#09090B] font-bold text-black">[GRID_POS: 01-A]</span>
              </div>
            )}
            <h1 className="text-2xl font-black">01. MF LABS VITE REACT AUDIT ENGINE</h1>
            <p className="text-slate-700">Volledig geautomatiseerde Audit Suite &amp; IKEA-stijl Montageplan Generator.</p>
            <button onClick={() => setStep(2)} className={btnPrimary}>START AUDIT -&gt;</button>
          </div>
        )}

        {step === 2 && (
          <div className={cardClass}>
            {is3D && (
              <div className="text-[10px] font-mono tracking-widest text-slate-500 border-b border-slate-200 pb-2 flex justify-between">
                <span>INDEX PLATE #02 — BEDRIJFSPROFIEL [SYS_ID: 884-BX]</span>
                <span className="bg-slate-100 px-1.5 py-0.5 border border-[#09090B] font-bold text-black">[GRID_POS: 02-A]</span>
              </div>
            )}
            <h2 className="text-xl font-black">02. BEDRIJFSPROFIEL &amp; SOFTWARE INVOER</h2>
            <div className="grid grid-cols-2 gap-4">
              <input value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="Bedrijfsnaam" className={inputClass} />
              <div className="space-y-1">
                <input value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="E-mailadres" className={inputClass} />
                {emailError && (
                  <div className={`p-2 font-bold text-xs border-2 border-[#09090B] text-white ${is3D ? 'bg-[#FF3B00] shadow-[3px_3px_0px_0px_#09090B]' : 'bg-[#FF5722]'}`}>
                    ⚠️ FOUT: ongeldig e-mailadres invoer_
                  </div>
                )}
              </div>
              <input value={compContact} onChange={(e) => setCompContact(e.target.value)} placeholder="Contactpersoon" className={inputClass} />
              <input value={compSector} onChange={(e) => setCompSector(e.target.value)} placeholder="Sector" className={inputClass} />
            </div>
            <input value={compTools} onChange={(e) => setCompTools(e.target.value)} placeholder="Software (Gmail, Excel, Exact Online)" className={inputClass} />
            <button onClick={handleSaveStep2} className={btnPrimary}>VOLGENDE -&gt;</button>
          </div>
        )}

        {step === 3 && (
          <div className={cardClass}>
            {is3D && (
              <div className="text-[10px] font-mono tracking-widest text-slate-500 border-b border-slate-200 pb-2 flex justify-between">
                <span>INDEX PLATE #03 — WORKFLOWS [SYS_ID: 884-CX]</span>
                <span className="bg-slate-100 px-1.5 py-0.5 border border-[#09090B] font-bold text-black">[GRID_POS: 03-A]</span>
              </div>
            )}
            <h2 className="text-xl font-black">03. WORKFLOWS ({store.workflows.length})</h2>
            <div className="space-y-2 border-2 border-[#09090B] p-4 bg-slate-50">
              <input value={wfName} onChange={(e) => setWfName(e.target.value)} placeholder="Procesnaam (bv. Facturatie)" className={inputClass} />
              <input value={wfHours} onChange={(e) => setWfHours(e.target.value)} type="number" placeholder="Uren/wk" className={inputClass} />
              <input value={wfKeywords} onChange={(e) => setWfKeywords(e.target.value)} placeholder="Keywords (factuur, email)" className={inputClass} />
              <textarea value={wfDesc} onChange={(e) => setWfDesc(e.target.value)} placeholder="Omschrijving knelpunten" className={inputClass} />
              <button onClick={handleAddWorkflow} className="px-4 py-2 border-2 border-[#09090B] bg-black text-white font-bold">+ TOEVOEGEN</button>
            </div>
            <div className="space-y-2">
              {store.workflows.map((w) => (
                <div key={w.id} className="border-2 border-[#09090B] p-3 flex justify-between bg-white">
                  <div>
                    <div className="font-bold">{w.processName} ({w.timeSpentPerWeek}u/wk)</div>
                    <div className="text-xs text-slate-600">{w.description}</div>
                  </div>
                  <button onClick={() => store.removeWorkflow(w.id)} className="text-[#FF3B00] font-bold">VERWIJDER</button>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(4)} className={btnPrimary}>VOLGENDE -&gt;</button>
          </div>
        )}

        {step === 4 && (
          <div className={cardClass}>
            {is3D && (
              <div className="text-[10px] font-mono tracking-widest text-slate-500 border-b border-slate-200 pb-2 flex justify-between">
                <span>INDEX PLATE #04 — PRIVACY RUNNER [SYS_ID: 884-DX]</span>
                <span className="bg-slate-100 px-1.5 py-0.5 border border-[#09090B] font-bold text-black">[GRID_POS: 04-A]</span>
              </div>
            )}
            <h2 className="text-xl font-black">04. PRIVACY &amp; ANALYSE RUNNER</h2>
            <input value={privLocs} onChange={(e) => setPrivLocs(e.target.value)} placeholder="Data locaties (Google Drive, OneDrive)" className={inputClass} />
            {/* VERBETERING: privCompliance input toegevoegd (Verholpen ghost state) */}
            {is3D && (
              <div className="text-[10px] font-mono tracking-widest text-slate-500 border-b border-slate-200 pb-2 flex justify-between">
                <span>INDEX PLATE #04.B — COMPLIANCE [SYS_ID: 884-DX]</span>
              </div>
            )}
            <input value={privCompliance} type="number" min="0" max="100" onChange={(e) => setPrivCompliance(parseInt(e.target.value) || 0)} placeholder="Gemiddeld Compliance Niveau (0-100)" className={inputClass} />
            <textarea value={privRisks} onChange={(e) => setPrivRisks(e.target.value)} placeholder="Privacy risico's" className={inputClass} />
            <button onClick={runEngine} className={btnPrimary}>RUN ENGINE ⚡</button>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={cardClass}>
                {is3D && (
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 border-b border-slate-200 pb-2 flex justify-between">
                    <span>PLATE #05-A — IMPACT METRICS [SYS_ID: METRIC_332]</span>
                  </div>
                )}
                <h3 className="text-lg font-black">MONOSPACE IMPACT CHART</h3>
                <div className="space-y-3 pt-2">
                  {store.components.map((c) => (
                    <div key={c.id} className="space-y-1">
                      <div className="flex justify-between font-bold text-xs">
                        <span>{c.title.toUpperCase()}</span>
                        <span>{c.impactScore}/10</span>
                      </div>
                      <div className="w-full bg-slate-200 border border-[#09090B] h-4 flex">
                        <div
                          className={is3D ? 'bg-[#FF3B00] border-r border-[#09090B]' : 'bg-[#FF5722]'}
                          style={{ width: `${c.impactScore * 10}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={cardClass}>
                {is3D && (
                  <div className="text-[10px] font-mono tracking-widest text-slate-500 border-b border-slate-200 pb-2 flex justify-between">
                    <span>PLATE #05-B — IKEA MONTAGEPLAN [SYS_ID: ASSEMBLY_991]</span>
                  </div>
                )}
                <h3 className="text-lg font-black">IKEA MONTAGEHANDLEIDING</h3>
                <div className="space-y-3 pt-2">
                  {store.components.map((c, i) => (
                    <div key={c.id} className="border-2 border-[#09090B] p-3 bg-white space-y-1">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <span className="bg-black text-white px-2 py-0.5">0{i + 1}</span>
                        <span>{c.title}</span>
                      </div>
                      <p className="text-xs text-slate-600">{c.description}</p>
                      <div className="text-[10px] font-bold text-[#FF3B00]">
                        ⚡ LINK: {c.requiredTools.join(' -&gt; ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {/* VERBETERING: PDF Download knop toegevoegd (Verholpen ontbrekende knop) */}
              <button onClick={handleDownloadPDF} className={btnPrimary}>[ DOWNLOAD PDF RAPPORTAGE ]</button>
              <button onClick={() => store.resetAudit()} className={btnPrimary}>START NIEUWE AUDIT -&gt;</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
