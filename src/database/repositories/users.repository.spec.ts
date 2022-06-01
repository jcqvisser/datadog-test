import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { UserToCreate } from '../entities';
import { ExcelBankingDatabaseModule } from '../excel-banking-database.module';
import { UsersFactory } from '../test-helpers/factories/users.factory';
import { UsersRepository } from './users.repository';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let module: TestingModule;
  let factory: UsersFactory;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ExcelBankingDatabaseModule],
      providers: [UsersFactory],
    }).compile();

    repository = module.get(UsersRepository);
    factory = module.get(UsersFactory);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('findOrCreateOrFail', () => {
    describe('when the user exists', () => {
      it('returns the user', async () => {
        const user = await factory.create({});
        const foundOrCreatedUser = repository.findOrCreateOrFail(user);
        await expect(foundOrCreatedUser).resolves.toMatchObject(user);
      });
    });

    describe('when the user does not exist', () => {
      it('creates the user', async () => {
        const foundOrCreatedUser = repository.findOrCreateOrFail({
          email: `${v4()}@example.com`,
          name: v4(),
        });
        await expect(foundOrCreatedUser).resolves.toBeDefined();
      });
    });

    describe('when the user is invalid', () => {
      it('throws an error', async () => {
        const result = repository.findOrCreateOrFail(<UserToCreate>{});
        await expect(result).rejects.toBeDefined();
      });
    });
  });
});
