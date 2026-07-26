import { describe, it, expect, beforeEach } from 'vitest';
import { useAuditStore } from './auditStore';

describe('MF Labs Audit Store', () => {
  // Reset de store voor elke test zodat we altijd schoon beginnen
  beforeEach(() => {
    useAuditStore.getState().resetAudit();
  });

  it('moet initialiseren met lege waarden en de juiste standaard data structuur', () => {
    const state = useAuditStore.getState();
    expect(state.company.name).toBe('');
    expect(state.workflows.length).toBe(0);
    expect(state.components.length).toBe(0);
    expect(state.privacy.avgComplianceLevel).toBe(0);
  });

  it('moet bedrijfsgegevens correct kunnen instellen via setCompany', () => {
    useAuditStore.getState().setCompany({ name: 'Saikou Tech', sector: 'Software' });
    const state = useAuditStore.getState();
    expect(state.company.name).toBe('Saikou Tech');
    expect(state.company.sector).toBe('Software');
    expect(state.company.email).toBe(''); // Onveranderde velden moeten behouden blijven
  });

  it('moet de workflows correct toevoegen, overschrijven (JSON import) en verwijderen', () => {
    const wf1 = { id: 'wf-1', processName: 'Facturatie', timeSpentPerWeek: 5, keywords: 'factuur', description: 'test' };
    const wf2 = { id: 'wf-2', processName: 'Onboarding', timeSpentPerWeek: 12, keywords: 'contract', description: 'test2' };
    
    // Voeg toe
    useAuditStore.getState().addWorkflow(wf1);
    expect(useAuditStore.getState().workflows.length).toBe(1);

    // Overschrijf (simuleer JSON import via onze nieuwe actie)
    useAuditStore.getState().setWorkflows([wf1, wf2]);
    expect(useAuditStore.getState().workflows.length).toBe(2);
    expect(useAuditStore.getState().workflows[1].processName).toBe('Onboarding');

    // Verwijder
    useAuditStore.getState().removeWorkflow('wf-1');
    expect(useAuditStore.getState().workflows.length).toBe(1);
    expect(useAuditStore.getState().workflows[0].id).toBe('wf-2');
  });

  it('moet privacy compliance en locaties correct kunnen updaten via setPrivacy', () => {
    useAuditStore.getState().setPrivacy({ avgComplianceLevel: 85, dataLocations: ['NL-AMS-1', 'EU-WEST'] });
    const state = useAuditStore.getState();
    expect(state.privacy.avgComplianceLevel).toBe(85);
    expect(state.privacy.dataLocations).toContain('NL-AMS-1');
  });

  it('moet de engine resultaten (components) kunnen opslaan', () => {
    const mockComponent = {
      id: 'rule-test',
      title: 'Test Script',
      description: 'Een test voor de AI engine.',
      requiredTools: ['Tool A'],
      impactScore: 9,
      estimatedTimeSaveHours: 14,
      complexityLevel: 'Hoog' as const
    };
    useAuditStore.getState().setComponents([mockComponent]);
    const state = useAuditStore.getState();
    expect(state.components.length).toBe(1);
    expect(state.components[0].impactScore).toBe(9);
  });
});
