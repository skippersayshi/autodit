import React, { useState } from 'react';
import { useAuditStore } from './store/auditStore';

export default function App() {
  const [step, setStep] = useState(1);
  const store = useAuditStore();

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

  const handleSaveStep2 = () => {
    if (!compName || !compEmail) {
      alert('Vul ten minste bedrijfsnaam en e-mailadres in.');
      return;
    }
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
      privRisks
    ].join(' ').toLowerCase();

    const rules = [
      { id: 'rule-invoice', triggers: ['factuur', 'invoice', 'betaling'], title: 'Factuur-Check Script', desc: 'Automatische controle van inkomende facturen.', tools: ['Mailbox Connector', 'OCR Engine'], base: 8 },
      { id: 'rule-mail', triggers: ['mail', 'inbox', 'klant'], title: 'Mail-Flow Agent', desc: 'Sorteert mails en verstuurt automatische opvolging.', tools: ['LLM Gateway', 'SMTP Broker'], base: 7 },
      { id: 'rule-onboarding', triggers: ['onboarding', 'medewerker', 'contract'], title: 'Onboarding Automator', desc: 'Zet automatisch accounts en documenten klaar.', tools: ['HRM API', 'Identity Provider'], base: 6 }
    ];

    const matched = rules.filter(r => r.triggers.some(t => corpus.includes(t)));
    const selected = matched.length > 0 ? matched : [rules[0]];

    const totalHours = store.workflows.reduce((sum, w) => sum + w.timeSpentPerWeek, 0);
    const timeFactor = Math.min(1 + totalHours / 10, 2.0);
    const riskFactor = privRisks.length > 5 ? 1.3 : 1.0;

    const components = selected.map(c => {
      const impactScore = Math.min(Math.round(c.base * timeFactor * riskFactor), 10);
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

  return (
    <div className="min-h-screen flex flex-col font-mono text-sm">
      <header className="border-b border-[#242830] bg-[#121417] p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="font-bold text-[#00F0FF]">// MF LABS AUDIT REACT SUITE</span>
          <span className="text-xs text-[#8A959E]">VITE + REACT + TS (NODE 22)</span>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-6 flex-1 space-y-6">
        <div className="border border-[#242830] bg-[#121417] p-4 flex justify-between text-xs">
          <span>STAP 0{step} VAN 05</span>
          <button onClick={() => store.resetAudit()} className="text-[#FF4545]">RESET STATE</button>
        </div>

        {step === 1 && (
          <div className="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h1 className="text-2xl font-bold text-[#00F0FF]">MF LABS VITE REACT AUDIT ENGINE</h1>
            <p className="text-[#8A959E]">Volledig functionele React frontend gebouwd met Vite en Node 22.</p>
            <button onClick={() => setStep(2)} className="px-6 py-3 bg-[#00F0FF] text-black font-bold">START AUDIT -&gt;</button>
          </div>
        )}

        {step === 2 && (
          <div className="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h2 className="text-xl font-bold">BEDRIJFSPROFIEL</h2>
            <div className="grid grid-cols-2 gap-4">
              <input value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="Bedrijfsnaam" className="bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
              <input value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="E-mailadres" className="bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
              <input value={compContact} onChange={(e) => setCompContact(e.target.value)} placeholder="Contactpersoon" className="bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
              <input value={compSector} onChange={(e) => setCompSector(e.target.value)} placeholder="Sector" className="bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
            </div>
            <input value={compTools} onChange={(e) => setCompTools(e.target.value)} placeholder="Software (Gmail, Excel, Exact)" className="w-full bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
            <button onClick={handleSaveStep2} className="px-6 py-2 bg-[#00F0FF] text-black font-bold">VOLGENDE -&gt;</button>
          </div>
        )}

        {step === 3 && (
          <div className="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h2 className="text-xl font-bold">WORKFLOWS ({store.workflows.length})</h2>
            <div className="space-y-2 border border-[#242830] p-4 bg-[#0A0A0B]">
              <input value={wfName} onChange={(e) => setWfName(e.target.value)} placeholder="Procesnaam (bv. Facturatie)" className="w-full bg-[#121417] border border-[#242830] p-2 text-white outline-none" />
              <input value={wfHours} onChange={(e) => setWfHours(e.target.value)} type="number" placeholder="Uren/wk" className="w-full bg-[#121417] border border-[#242830] p-2 text-white outline-none" />
              <input value={wfKeywords} onChange={(e) => setWfKeywords(e.target.value)} placeholder="Keywords (factuur, email)" className="w-full bg-[#121417] border border-[#242830] p-2 text-white outline-none" />
              <textarea value={wfDesc} onChange={(e) => setWfDesc(e.target.value)} placeholder="Omschrijving knelpunten" className="w-full bg-[#121417] border border-[#242830] p-2 text-white outline-none" />
              <button onClick={handleAddWorkflow} className="px-4 py-2 border border-[#00F0FF] text-[#00F0FF] font-bold">+ TOEVOEGEN</button>
            </div>
            <div className="space-y-2">
              {store.workflows.map((w) => (
                <div key={w.id} className="border border-[#242830] p-3 flex justify-between bg-[#0A0A0B]">
                  <div>
                    <div className="font-bold">{w.processName} ({w.timeSpentPerWeek}u/wk)</div>
                    <div className="text-xs text-[#8A959E]">{w.description}</div>
                  </div>
                  <button onClick={() => store.removeWorkflow(w.id)} className="text-[#FF4545]">VERWIJDER</button>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(4)} className="px-6 py-2 bg-[#00F0FF] text-black font-bold">VOLGENDE -&gt;</button>
          </div>
        )}

        {step === 4 && (
          <div className="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h2 className="text-xl font-bold">PRIVACY & ANALSE RUNNER</h2>
            <input value={privLocs} onChange={(e) => setPrivLocs(e.target.value)} placeholder="Data locaties (Google Drive, OneDrive)" className="w-full bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
            <textarea value={privRisks} onChange={(e) => setPrivRisks(e.target.value)} placeholder="Privacy risico's" className="w-full bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
            <button onClick={runEngine} className="px-6 py-3 bg-[#00F0FF] text-black font-bold">RUN ENGINE ⚡</button>
          </div>
        )}

        {step === 5 && (
          <div className="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h2 className="text-xl font-bold text-[#00F0FF]">ANALYSE RESULTATEN & IKEA BOUWPLAN</h2>
            <div className="grid grid-cols-2 gap-4">
              {store.components.map((c, i) => (
                <div key={c.id} className="border border-[#242830] bg-[#0A0A0B] p-4 space-y-2">
                  <div className="flex justify-between text-xs text-[#00F0FF]">
                    <span>ONDERDEEL 0{i + 1}</span>
                    <span>IMPACT: {c.impactScore}/10</span>
                  </div>
                  <h3 className="font-bold">{c.title}</h3>
                  <p className="text-xs text-[#8A959E]">{c.description}</p>
                  <div className="text-xs pt-2 border-t border-[#242830]">
                    TOOLS: {c.requiredTools.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
