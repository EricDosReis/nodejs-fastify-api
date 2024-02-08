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
    const { amount, title } = transactionMock;

    await request(app.server)
      .post('/transactions')
      .send({
        title,
        amount,
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

    const getTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    expect(getTransactionsResponse.body).toEqual(
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

  it('should be able to get a specific transaction', async () => {
    const { amount, title } = transactionMock;

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title,
        amount,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    const getTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies);

    const transactionId = getTransactionsResponse.body.transactions[0].id;

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        transaction: expect.objectContaining({
          title,
          amount,
        }),
      }),
    );
  });

  it('should be able to get the summary', async () => {
    const creditTransactionAmount = 1000;
    const debitTransactionAmount = 300;

    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'Credit transaction',
        amount: creditTransactionAmount,
        type: 'credit',
      });

    const cookies = createTransactionResponse.get('Set-Cookie');

    await request(app.server)
      .post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'Debit transaction',
        amount: debitTransactionAmount,
        type: 'debit',
      });

    const getTransactionsSummaryResponse = await request(app.server)
      .get(`/transactions/summary`)
      .set('Cookie', cookies)
      .expect(200);

    expect(getTransactionsSummaryResponse.body).toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({
          amount: creditTransactionAmount - debitTransactionAmount,
        }),
      }),
    );
  });
});
