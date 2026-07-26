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
