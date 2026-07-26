import { z } from 'zod';

export const CompanySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  sector: z.string().optional()
});

export const AuditSchema = z.object({
  company: CompanySchema
});
