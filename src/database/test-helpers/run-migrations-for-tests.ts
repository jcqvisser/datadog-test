// Weird imports because Jest needs to be able to run this as part of a setup step ¯\_(ツ)_/¯
import knexModule = require('knex');
import knexfile = require('../knexfile');
import { Knex } from 'knex';

import dotenv = require('dotenv');
dotenv.config();

export const runMigrationsForTests = async (): Promise<void> => {
  const originalKnexfile: Knex.Config = { ...knexfile };
  const knexfileForTest = {
    ...originalKnexfile,
    connection: {
      connectionString: process.env.DATABASE_URL_TEST,
      ssl: undefined,
    },
    migrations: {
      ...originalKnexfile.migrations,
      directory: './packages/excel-banking-database/src/migrations',
    },
  };

  const knex = knexModule.knex(knexfileForTest);
  await knex.migrate.latest();
};
