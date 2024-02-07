import type { FastifyInstance } from 'fastify';
import { randomUUID } from 'node:crypto';

import { knex } from '../../database';
import { createBodySchema, getTransactionParamsSchema } from './schemas';

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select();

    return { transactions };
  });

  app.get('/:id', async request => {
    const { id } = getTransactionParamsSchema.parse(request.params);

    const transaction = await knex('transactions').where('id', id).first();

    return { transaction };
  });

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
