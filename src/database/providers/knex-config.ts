import * as dotenv from 'dotenv';
import type { Knex } from 'knex';

dotenv.config();

export class KnexConfig implements Knex.Config {}
