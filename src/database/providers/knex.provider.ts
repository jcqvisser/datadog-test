import { default as createKnexInstance } from 'knex';
import { KnexConfig } from './knex-config';

export const KNEX = 'knex';

export const knexProvider = {
  provide: KNEX,
  useFactory: (knexConfig: KnexConfig) => createKnexInstance(knexConfig),
  inject: [KnexConfig],
};
