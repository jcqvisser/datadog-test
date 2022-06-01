import { Inject, Injectable } from '@nestjs/common';
import { User, UserMetadata, UserToCreate } from '../entities/user.entity';
import { Knex } from '../providers/knex';
import { KNEX } from '../providers/knex.provider';
import { Repository } from './_repository';

const Base = Repository<User>(UserMetadata);

@Injectable()
export class UsersRepository extends Base {
  constructor(@Inject(KNEX) knex: Knex) {
    super(knex);
  }

  async findByEmail(email: string, trx?: Knex.Transaction): Promise<User | undefined> {
    const query = this.knex
      .select(UserMetadata.columns)
      .from(UserMetadata.tableName)
      .where({ [UserMetadata.email]: email })
      .limit(1);
    const result = await this.execQueryWithOptionalTransaction(trx, query);
    return result?.[0] as User | undefined;
  }

  async findOrCreateOrFail(user: UserToCreate, trx?: Knex.Transaction): Promise<User> {
    return await this.withTransaction(trx, async (trx1) => {
      await trx1.raw('LOCK TABLE ?? IN SHARE ROW EXCLUSIVE MODE', [UserMetadata.tableName]);
      const foundUser = await this.findByEmail(user.email, trx1);
      if (foundUser) return foundUser;
      return await this.createOrFail(user, trx1);
    });
  }
}
