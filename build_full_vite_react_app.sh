#!/usr/bin/env bash
set -e

echo "=== [MF LABS] NOUWBOUW VOLLEDIGE VITE + REACT (NODE 22) MONOREPO ==="

# 1. MAPSTRUCTUUR AANMAKEN
mkdir -p .github/workflows scripts
mkdir -p frontend/src/types frontend/src/store frontend/src/styles
mkdir -p backend/src/engine backend/src/templates

# 2. ROOT CONFIGURATIE
cat << 'EOT' > .gitignore
node_modules/
dist/
tmp/
.env
.DS_Store
EOT

cat << 'EOT' > README.md
# MF Labs Audit — Vite React Monorepo

Volledig geautomatiseerde Audit Suite & IKEA-stijl Montageplan Generator.

## Architectuur
- **Frontend**: React 18 + Vite 5 + TypeScript + Zustand + Tailwind CSS
- **Backend**: Fastify + Zod + Handlebars + Puppeteer
- **CI/CD**: GitHub Actions met Node 22 Runtime
EOT

# 3. FRONTEND: PACKAGE.JSON & VITE CONFIGURATIE
cat << 'EOT' > frontend/package.json
{
  "name": "mf-labs-audit-frontend",
  "version": "1.2.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zod": "^3.23.8",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.5.3",
    "vite": "^5.3.3"
  }
}
EOT

cat << 'EOT' > frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
EOT

cat << 'EOT' > frontend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
EOT

cat << 'EOT' > frontend/index.html
<!DOCTYPE html>
<html lang="nl" class="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MF Labs Audit — React Suite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
</head>
<body class="bg-[#0A0A0B] text-[#E6EEF0] font-mono selection:bg-[#00F0FF] selection:text-black min-h-screen">
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
EOT

# 4. FRONTEND BRONCODE (TYPES, STORE, STYLES, REACT COMPONENTS)
cat << 'EOT' > frontend/src/types/models.ts
export type Company = {
  name: string;
  contactPerson: string;
  email: string;
  sector: string;
  toolsUsed: string[];
};

export type Workflow = {
  id: string;
  processName: string;
  timeSpentPerWeek: number;
  keywords: string;
  description: string;
};

export type Privacy = {
  dataLocations: string[];
  privacyRisks: string;
  avgComplianceLevel: 'laag' | 'gemiddeld' | 'hoog';
};

export type ComponentItem = {
  id: string;
  title: string;
  description: string;
  impactScore: number;
  requiredTools: string[];
  estimatedTimeSaveHours: number;
  complexityLevel: 'Laag' | 'Middel' | 'Hoog';
};

export type AuditState = {
  company: Company;
  workflows: Workflow[];
  privacy: Privacy;
  components: ComponentItem[];
};
EOT

cat << 'EOT' > frontend/src/store/auditStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuditState, Company, Workflow, Privacy, ComponentItem } from '../types/models';

type AuditActions = {
  setCompany: (company: Partial<Company>) => void;
  addWorkflow: (workflow: Workflow) => void;
  removeWorkflow: (id: string) => void;
  setPrivacy: (privacy: Partial<Privacy>) => void;
  setComponents: (components: ComponentItem[]) => void;
  resetAudit: () => void;
};

const initialState: AuditState = {
  company: { name: '', contactPerson: '', email: '', sector: '', toolsUsed: [] },
  workflows: [],
  privacy: { dataLocations: [], privacyRisks: '', avgComplianceLevel: 'gemiddeld' },
  components: []
};

export const useAuditStore = create<AuditState & AuditActions>()(
  persist(
    (set) => ({
      ...initialState,
      setCompany: (data) => set((s) => ({ company: { ...s.company, ...data } })),
      addWorkflow: (w) => set((s) => ({ workflows: [...s.workflows, w] })),
      removeWorkflow: (id) => set((s) => ({ workflows: s.workflows.filter((item) => item.id !== id) })),
      setPrivacy: (data) => set((s) => ({ privacy: { ...s.privacy, ...data } })),
      setComponents: (components) => set({ components }),
      resetAudit: () => set(initialState)
    }),
    { name: 'mf_labs_react_audit_state' }
  )
);
EOT

cat << 'EOT' > frontend/src/styles/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  border-radius: 0px !important;
}

body {
  background-color: #0A0A0B;
  color: #E6EEF0;
  font-family: 'IBM Plex Mono', monospace;
}
EOT

cat << 'EOT' > frontend/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOT

cat << 'EOT' > frontend/src/App.tsx
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
    <div class="min-h-screen flex flex-col font-mono text-sm">
      <header class="border-b border-[#242830] bg-[#121417] p-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <span class="font-bold text-[#00F0FF]">// MF LABS AUDIT REACT SUITE</span>
          <span class="text-xs text-[#8A959E]">VITE + REACT + TS (NODE 22)</span>
        </div>
      </header>

      <main class="max-w-7xl w-full mx-auto p-6 flex-1 space-y-6">
        <div class="border border-[#242830] bg-[#121417] p-4 flex justify-between text-xs">
          <span>STAP 0{step} VAN 05</span>
          <button onClick={() => store.resetAudit()} class="text-[#FF4545]">RESET STATE</button>
        </div>

        {step === 1 && (
          <div class="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h1 class="text-2xl font-bold text-[#00F0FF]">MF LABS VITE REACT AUDIT ENGINE</h1>
            <p class="text-[#8A959E]">Volledig functionele React frontend gebouwd met Vite en Node 22.</p>
            <button onClick={() => setStep(2)} class="px-6 py-3 bg-[#00F0FF] text-black font-bold">START AUDIT -></button>
          </div>
        )}

        {step === 2 && (
          <div class="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h2 class="text-xl font-bold">BEDRIJFSPROFIEL</h2>
            <div class="grid grid-cols-2 gap-4">
              <input value={compName} onChange={(e) => setCompName(e.target.value)} placeholder="Bedrijfsnaam" class="bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
              <input value={compEmail} onChange={(e) => setCompEmail(e.target.value)} placeholder="E-mailadres" class="bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
              <input value={compContact} onChange={(e) => setCompContact(e.target.value)} placeholder="Contactpersoon" class="bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
              <input value={compSector} onChange={(e) => setCompSector(e.target.value)} placeholder="Sector" class="bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
            </div>
            <input value={compTools} onChange={(e) => setCompTools(e.target.value)} placeholder="Software (Gmail, Excel, Exact)" class="w-full bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
            <button onClick={handleSaveStep2} class="px-6 py-2 bg-[#00F0FF] text-black font-bold">VOLGENDE -></button>
          </div>
        )}

        {step === 3 && (
          <div class="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h2 class="text-xl font-bold">WORKFLOWS ({store.workflows.length})</h2>
            <div class="space-y-2 border border-[#242830] p-4 bg-[#0A0A0B]">
              <input value={wfName} onChange={(e) => setWfName(e.target.value)} placeholder="Procesnaam (bv. Facturatie)" class="w-full bg-[#121417] border border-[#242830] p-2 text-white outline-none" />
              <input value={wfHours} onChange={(e) => setWfHours(e.target.value)} type="number" placeholder="Uren/wk" class="w-full bg-[#121417] border border-[#242830] p-2 text-white outline-none" />
              <input value={wfKeywords} onChange={(e) => setWfKeywords(e.target.value)} placeholder="Keywords (factuur, email)" class="w-full bg-[#121417] border border-[#242830] p-2 text-white outline-none" />
              <textarea value={wfDesc} onChange={(e) => setWfDesc(e.target.value)} placeholder="Omschrijving knelpunten" class="w-full bg-[#121417] border border-[#242830] p-2 text-white outline-none" />
              <button onClick={handleAddWorkflow} class="px-4 py-2 border border-[#00F0FF] text-[#00F0FF] font-bold">+ TOEVOEGEN</button>
            </div>
            <div class="space-y-2">
              {store.workflows.map((w) => (
                <div key={w.id} class="border border-[#242830] p-3 flex justify-between bg-[#0A0A0B]">
                  <div>
                    <div class="font-bold">{w.processName} ({w.timeSpentPerWeek}u/wk)</div>
                    <div class="text-xs text-[#8A959E]">{w.description}</div>
                  </div>
                  <button onClick={() => store.removeWorkflow(w.id)} class="text-[#FF4545]">VERWIJDER</button>
                </div>
              ))}
            </div>
            <button onClick={() => setStep(4)} class="px-6 py-2 bg-[#00F0FF] text-black font-bold">VOLGENDE -></button>
          </div>
        )}

        {step === 4 && (
          <div class="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h2 class="text-xl font-bold">PRIVACY & ANALSE RUNNER</h2>
            <input value={privLocs} onChange={(e) => setPrivLocs(e.target.value)} placeholder="Data locaties (Google Drive, OneDrive)" class="w-full bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
            <textarea value={privRisks} onChange={(e) => setPrivRisks(e.target.value)} placeholder="Privacy risico's" class="w-full bg-[#0A0A0B] border border-[#242830] p-2 text-white outline-none" />
            <button onClick={runEngine} class="px-6 py-3 bg-[#00F0FF] text-black font-bold">RUN ENGINE ⚡</button>
          </div>
        )}

        {step === 5 && (
          <div class="border border-[#242830] bg-[#121417] p-6 space-y-4">
            <h2 class="text-xl font-bold text-[#00F0FF]">ANALYSE RESULTATEN & IKEA BOUWPLAN</h2>
            <div class="grid grid-cols-2 gap-4">
              {store.components.map((c, i) => (
                <div key={c.id} class="border border-[#242830] bg-[#0A0A0B] p-4 space-y-2">
                  <div class="flex justify-between text-xs text-[#00F0FF]">
                    <span>ONDERDEEL 0{i + 1}</span>
                    <span>IMPACT: {c.impactScore}/10</span>
                  </div>
                  <h3 class="font-bold">{c.title}</h3>
                  <p class="text-xs text-[#8A959E]">{c.description}</p>
                  <div class="text-xs pt-2 border-t border-[#242830]">
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
EOT

# 5. BACKEND BRONCODE
cat << 'EOT' > backend/package.json
{
  "name": "mf-labs-audit-backend",
  "version": "1.2.0",
  "private": true,
  "main": "dist/server.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "fastify": "^4.28.1",
    "handlebars": "^4.7.8",
    "puppeteer": "^22.12.1",
    "uuid": "^10.0.0",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.5.3"
  }
}
EOT

cat << 'EOT' > backend/tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
EOT

cat << 'EOT' > backend/src/schema.ts
import { z } from 'zod';

export const CompanySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  sector: z.string().optional()
});

export const AuditSchema = z.object({
  company: CompanySchema
});
EOT

cat << 'EOT' > backend/src/engine/extract.ts
export function extractText(input: any): string {
  return JSON.stringify(input).toLowerCase();
}
EOT

cat << 'EOT' > backend/src/engine/mapping.ts
import { v4 as uuidv4 } from 'uuid';

export function mapComponents(text: string) {
  return [
    {
      id: uuidv4(),
      title: 'Factuur-Check Script',
      description: 'Automatische factuurcontrole.',
      requiredTools: ['Mailbox Connector', 'OCR Engine'],
      baseImpact: 8
    }
  ];
}
EOT

cat << 'EOT' > backend/src/engine/scoring.ts
export function scoreComponents(components: any[]) {
  return components.map((c) => ({
    ...c,
    impactScore: c.baseImpact,
    estimatedTimeSaveHours: c.baseImpact * 1.5,
    complexityLevel: 'Middel'
  }));
}
EOT

cat << 'EOT' > backend/src/templates/report.hbs
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8"/>
  <title>MF LABS AUDIT MONTAGEPLAN</title>
  <style>
    body { font-family: monospace; color: #111; padding: 20px; }
    .box { border: 2px solid #111; padding: 15px; margin-bottom: 15px; }
  </style>
</head>
<body>
  <h1>BOUWPLAN: {{company.name}}</h1>
  {{#each components}}
  <div class="box">
    <h3>{{title}} (IMPACT: {{impactScore}}/10)</h3>
    <p>{{description}}</p>
  </div>
  {{/each}}
</body>
</html>
EOT

cat << 'EOT' > backend/src/server.ts
import Fastify from 'fastify';
import { AuditSchema } from './schema';
import { extractText } from './engine/extract';
import { mapComponents } from './engine/mapping';
import { scoreComponents } from './engine/scoring';

const server = Fastify({ logger: true });

server.post('/api/audit', async (request, reply) => {
  const body = AuditSchema.parse(request.body);
  const text = extractText(body);
  const mapped = mapComponents(text);
  const scored = scoreComponents(mapped);
  return { status: 'success', components: scored };
});

const start = async () => {
  try {
    await server.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
start();
EOT

# 6. GITHUB ACTIONS WORKFLOW MET NODE 22 (VITE + REACT BUILD)
cat << 'EOT' > .github/workflows/deploy.yml
name: Deploy React Vite App to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22
        uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install & Build React Frontend
        run: |
          cd frontend
          npm install
          npm run build

      - name: Upload Pages Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './frontend/dist'

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
