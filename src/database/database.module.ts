import { Global, Inject, Module, OnModuleDestroy } from '@nestjs/common';
import { Knex } from 'knex';
import { knexConfigProvider } from './providers/knex-config.provider';
import { KnexTransaction } from './providers/knex-transaction';
import { KNEX, knexProvider } from './providers/knex.provider';
import { UsersRepository } from './repositories/users.repository';

@Global()
@Module({
  providers: [
    knexProvider,
    knexConfigProvider,
    UsersRepository,
    KnexTransaction,
  ],
  exports: [UsersRepository, KnexTransaction],
})
export class DatabaseModule implements OnModuleDestroy {
  constructor(@Inject(KNEX) private readonly knex: Knex) {}

  async onModuleDestroy() {
    await new Promise((resolve) => this.knex.destroy(resolve));
  }
}
