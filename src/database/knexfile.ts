import type { Knex } from 'knex';
import * as knexStringcase from 'knex-stringcase';

import dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });
dotenv.config();

let config: Knex.Config = {
  client: 'postgres',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
    loadExtensions: ['.ts'],
  },
};

config = knexStringcase({
  ...config,
  stringcase: 'snakecase', // A function or a string which describes how keys should be modified when headed to the database. This attribute may also be be an array and operates very similarly to appStringcase above.
  appStringcase: 'camelcase', // A function or a string which describes how keys should re-enter your application from the database. If a string is provided keys will be modified by their respective function found in npm stringcase. Alternatively a function can be passed, taking the string in its current state which will give you more control to suit your needs.
});

module.exports = config;
