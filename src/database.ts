import { Knex, knex as setupKnex } from 'knex';

import { env } from './env';

const databaseConnection =
  env.DATABASE_CLIENT === 'sqlite'
    ? {
        filename: env.DATABASE_URL,
      }
    : env.DATABASE_URL;

export const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: databaseConnection,
  migrations: {
    directory: './db/migrations',
    extension: 'ts',
  },
  useNullAsDefault: true,
};

export const knex = setupKnex(config);
