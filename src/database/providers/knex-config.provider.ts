import * as config from '../knexfile';
import { KnexConfig } from './knex-config';

export const knexConfigProvider = {
  provide: KnexConfig,
  useValue: config,
};
