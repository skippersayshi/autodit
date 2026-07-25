export function scoreComponents(comps: any[]) {
  return comps.map(c => ({ ...c, impactScore: c.baseImpact }));
}
