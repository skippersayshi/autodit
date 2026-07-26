export function scoreComponents(components: any[]) {
  return components.map((c) => ({
    ...c,
    impactScore: c.baseImpact,
    estimatedTimeSaveHours: c.baseImpact * 1.5,
    complexityLevel: 'Middel'
  }));
}
