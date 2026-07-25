import { z } from 'zod';
export const AuditSchema = z.object({ company: z.object({ name: z.string() }) });
