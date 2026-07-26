import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Company {
  name: string;
  email: string;
  contactPerson: string;
  sector: string;
  toolsUsed: string[];
}

export interface Workflow {
  id: string;
  processName: string;
  timeSpentPerWeek: number;
  keywords: string;
  description: string;
}

export interface Privacy {
  dataLocations: string[];
  privacyRisks: string;
  avgComplianceLevel: number;
}

export interface Component {
  id: string;
  title: string;
  description: string;
  requiredTools: string[];
  impactScore: number; // 0-10
  estimatedTimeSaveHours: number;
  complexityLevel: 'Laag' | 'Middel' | 'Hoog';
}

interface AuditState {
  company: Company;
  workflows: Workflow[];
  privacy: Privacy;
  components: Component[];
  
  // Acties
  setCompany: (company: Partial<Company>) => void;
  addWorkflow: (workflow: Workflow) => void;
  removeWorkflow: (id: string) => void;
  setWorkflows: (workflows: Workflow[]) => void; // VOEGEVOEGDE ACTIE
  setPrivacy: (privacy: Partial<Privacy>) => void;
  setComponents: (components: Component[]) => void;
  resetAudit: () => void;
}

const initialCompany: Company = { name: '', email: '', contactPerson: '', sector: '', toolsUsed: [] };
const initialPrivacy: Privacy = { dataLocations: [], privacyRisks: '', avgComplianceLevel: 0 };

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      company: initialCompany,
      workflows: [],
      privacy: initialPrivacy,
      components: [],

      setCompany: (company) => set((state) => ({ company: { ...state.company, ...company } })),
      addWorkflow: (workflow) => set((state) => ({ workflows: [...state.workflows, workflow] })),
      removeWorkflow: (id) => set((state) => ({ workflows: state.workflows.filter((w) => w.id !== id) })),
      setWorkflows: (workflows) => set({ workflows }), // VOEGEVOEGDE ACTIE
      setPrivacy: (privacy) => set((state) => ({ privacy: { ...state.privacy, ...privacy } })),
      setComponents: (components) => set({ components }),
      resetAudit: () => set({ company: initialCompany, workflows: [], privacy: initialPrivacy, components: [] })
    }),
    {
      name: 'mf-labs-audit-vault', // Unieke key voor localStorage
    }
  )
);
