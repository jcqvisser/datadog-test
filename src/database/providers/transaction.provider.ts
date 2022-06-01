import { Provider } from '@nestjs/common';
import { KnexTransaction } from './knex-transaction';

export const TransactionProvider: Provider = {
  provide: KnexTransaction,
  useClass: KnexTransaction,
};
