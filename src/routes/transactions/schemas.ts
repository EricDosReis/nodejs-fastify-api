import { z } from 'zod';

export const createBodySchema = z.object({
  title: z.string(),
  amount: z.number(),
  type: z.enum(['credit', 'debit']),
});

export const getTransactionParamsSchema = z.object({
  id: z.string().uuid(),
});
