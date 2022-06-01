import { Inject, Injectable } from '@nestjs/common';
import { Knex } from './knex';
import { KNEX } from './knex.provider';

@Injectable()
export class KnexTransaction {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async run<T>(behavior: (config: Knex.Transaction) => Promise<T>): Promise<T> {
    return await this.knex.transaction(behavior);
  }

  async continueOrStartNew<T>(
    trx: Knex.Transaction | undefined,
    behavior: (config: Knex.Transaction) => Promise<T>
  ): Promise<T> {
    if (trx) {
      return await behavior(trx);
    } else {
      return await this.run(behavior);
    }
  }
}
