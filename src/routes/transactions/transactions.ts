import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

import { knex } from '../../database';
import { createBodySchema } from './schemas';

export async function transactionsRoutes(app: FastifyInstance) {
  app.post('/', async (request, response) => {
    const { amount, title, type } = createBodySchema.parse(request.body);

    await knex('transactions').insert({
      id: randomUUID(),
      amount: type === 'credit' ? amount : amount * -1,
      title,
    });

    return response.status(201).send();
  });
}
