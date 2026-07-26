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
