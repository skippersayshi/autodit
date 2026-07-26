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
