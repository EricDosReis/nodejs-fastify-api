import { execSync } from 'node:child_process';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { app } from '../src/app';

const transactionMock = {
  title: 'New transaction',
  amount: 100,
};

describe('/transacations', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 100,
        type: 'credit',
      })
      .expect(201);
  });

  it('should be able to list all transactions', async () => {
    const { amount, title } = transactionMock;

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title,
        amount,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    expect(listTransactionsResponse.body).toEqual(
      expect.objectContaining({
        transactions: expect.arrayContaining([
          expect.objectContaining({
            title,
            amount,
          }),
        ]),
      }),
    );
  });
});
