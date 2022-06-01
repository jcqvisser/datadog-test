import { Test, TestingModule } from '@nestjs/testing';
import { v4 } from 'uuid';
import { User, UserToCreate } from '../entities';
import { ExcelBankingDatabaseModule } from '../excel-banking-database.module';
import { Knex } from '../providers/knex';
import { KNEX } from '../providers/knex.provider';
import { UsersFactory } from '../test-helpers/factories/users.factory';
import { UsersRepository } from './users.repository';

describe('Repository', () => {
  let repository: UsersRepository;
  let module: TestingModule;
  let knex: Knex;
  let factory: UsersFactory;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ExcelBankingDatabaseModule],
      providers: [UsersFactory],
    }).compile();

    knex = module.get(KNEX);
    repository = module.get(UsersRepository);
    factory = module.get(UsersFactory);
  });

  afterEach(async () => {
    await new Promise((resolve) => knex.destroy(resolve));
    knex.destroy();
    await module.close();
  });

  describe('find', () => {
    it('finds an entity', async () => {
      const createdEntity = await factory.create({});
      const fetchedEntity = await repository.find(createdEntity.id);
      expect(fetchedEntity).toMatchObject(createdEntity);
    });

    it('returns undefined when the user does not exist', async () => {
      const fetchedEntity = await repository.find(-1);
      expect(fetchedEntity).toBeUndefined();
    });

    describe('within a transaction', () => {
      it('finds an entity', async () => {
        const createdEntity = await factory.create({});
        const fetchedEntity = await repository.transaction(() => repository.find(createdEntity.id));
        expect(fetchedEntity).toMatchObject(createdEntity);
      });

      it('returns undefined when the user does not exist', async () => {
        const fetchedEntity = await repository.transaction(() => repository.find(-1));
        expect(fetchedEntity).toBeUndefined();
      });
    });
  });

  describe('findOrFail', () => {
    it('finds an entity', async () => {
      const createdEntity = await factory.create({});
      const fetchedEntity = await repository.findOrFail(createdEntity.id);
      expect(fetchedEntity).toMatchObject(createdEntity);
    });

    it('returns undefined when the user does not exist', async () => {
      const fn = async () => await repository.findOrFail(-1);
      await expect(fn).rejects.toBeDefined();
    });

    describe('within a transaction', () => {
      it('finds an entity', async () => {
        const createdEntity = await factory.create({});
        const fetchedEntity = await repository.transaction(() => repository.findOrFail(createdEntity.id));
        expect(fetchedEntity).toMatchObject(createdEntity);
      });

      it('returns undefined when the user does not exist', async () => {
        const fn = async () => await repository.transaction(() => repository.findOrFail(-1));
        await expect(fn).rejects.toBeDefined();
      });
    });
  });

  describe('create', () => {
    it('can create a user', async () => {
      const entityToCreate = { email: `${v4()}@example.com`, name: v4() };
      const createdEntity = await repository.create(entityToCreate);

      expect(createdEntity).toMatchObject(entityToCreate);
      expect(createdEntity).toBeDefined();
      if (!createdEntity) fail();

      const fetchedUser = await repository.find(createdEntity.id);
      expect(fetchedUser).toMatchObject(createdEntity);
    });

    it('returns undefined if it cannot create a user', async () => {
      const user = await repository.create(<UserToCreate>{});
      expect(user).toBeUndefined();
    });

    describe('within a transaction', () => {
      it('can create a user', async () => {
        const entityToCreate = { email: `${v4()}@example.com`, name: v4() };
        const createdEntity = await repository.transaction(() => repository.create(entityToCreate));

        expect(createdEntity).toMatchObject(entityToCreate);
        expect(createdEntity).toBeDefined();
        if (!createdEntity) fail();

        const fetchedUser = await repository.find(createdEntity.id);
        expect(fetchedUser).toMatchObject(createdEntity);
      });

      it('returns undefined if it cannot create a user', async () => {
        const user = await repository.transaction(() => repository.create(<UserToCreate>{}));
        expect(user).toBeUndefined();
      });
    });
  });

  describe('createOrFail', () => {
    it('can create a user', async () => {
      const entityToCreate = { email: `${v4()}@example.com`, name: v4() };
      const createdEntity = await repository.createOrFail(entityToCreate);

      expect(createdEntity).toMatchObject(entityToCreate);

      const fetchedUser = await repository.find(createdEntity.id);
      expect(fetchedUser).toMatchObject(createdEntity);
    });

    it('throws an error when it cannot create a user', async () => {
      const fn = async () => await repository.createOrFail(<UserToCreate>{});
      await expect(fn).rejects.toBeDefined();
    });

    describe('within a transaction', () => {
      it('can create a user', async () => {
        const entityToCreate = { email: `${v4()}@example.com`, name: v4() };
        const createdEntity = await repository.transaction(() => repository.createOrFail(entityToCreate));

        expect(createdEntity).toMatchObject(entityToCreate);

        const fetchedUser = await repository.find(createdEntity.id);
        expect(fetchedUser).toMatchObject(createdEntity);
      });

      it('throws an error when it cannot create a user', async () => {
        const fn = async () => await repository.transaction(() => repository.createOrFail(<UserToCreate>{}));
        await expect(fn).rejects.toBeDefined();
      });
    });
  });

  describe('update', () => {
    it('updates a user entity', async () => {
      const createdEntity = await factory.create({});

      const newEntityValues: Partial<User> = { name: 'updated-name' };

      const updatedEntity = await repository.update(createdEntity.id, newEntityValues);
      if (!updatedEntity) fail();

      expect(updatedEntity).toMatchObject(newEntityValues);

      const fetchedEntity = await repository.find(createdEntity.id);
      expect(fetchedEntity).toMatchObject(updatedEntity);
    });

    it('updates the updated-at column', async () => {
      const createdEntity = await factory.create({});

      const oldUpdatedAt = createdEntity.updatedAt;

      const newEntityValues: Partial<User> = { name: 'updated-name' };

      await repository.update(createdEntity.id, newEntityValues);
      const fetchedEntity = await repository.find(createdEntity.id);
      if (!fetchedEntity) fail();

      const newUpdatedAt = fetchedEntity.updatedAt as Date;

      expect(newUpdatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
    });

    it('does not update the createdAt value', async () => {
      const createdEntity = await factory.create({});

      const oldCreatedAt = createdEntity.createdAt;

      const newEntityValues: Partial<User> = { createdAt: new Date(0) };
      await repository.update(createdEntity.id, newEntityValues);
      const fetchedEntity = await repository.find(createdEntity.id);

      const newCreatedAt = fetchedEntity?.createdAt;

      expect(oldCreatedAt.getTime()).toEqual(newCreatedAt?.getTime());
    });

    it('returns undefined when the user does not exist', async () => {
      const entity = await repository.update(-1, { email: `${v4()}@example.com` });
      expect(entity).toBeUndefined();
    });

    describe('within a transaction', () => {
      it('updates a user entity', async () => {
        const createdEntity = await factory.create({});

        const newEntityValues: Partial<User> = { name: 'updated-name' };

        const updatedEntity = await repository.transaction(() => repository.update(createdEntity.id, newEntityValues));
        if (!updatedEntity) fail();

        expect(updatedEntity).toMatchObject(newEntityValues);

        const fetchedEntity = await repository.find(createdEntity.id);
        expect(fetchedEntity).toMatchObject(updatedEntity);
      });

      it('updates the updated-at column', async () => {
        const createdEntity = await factory.create({});

        const oldUpdatedAt = createdEntity.updatedAt;

        const newEntityValues: Partial<User> = { name: 'updated-name' };

        await repository.transaction(() => repository.update(createdEntity.id, newEntityValues));
        const fetchedEntity = await repository.find(createdEntity.id);
        if (!fetchedEntity) fail();

        const newUpdatedAt = fetchedEntity.updatedAt as Date;

        expect(newUpdatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      });

      it('does not update the createdAt value', async () => {
        const createdEntity = await factory.create({});

        const oldCreatedAt = createdEntity.createdAt;

        const newEntityValues: Partial<User> = { createdAt: new Date(0) };
        await repository.transaction(() => repository.update(createdEntity.id, newEntityValues));
        const fetchedEntity = await repository.find(createdEntity.id);

        const newCreatedAt = fetchedEntity?.createdAt;

        expect(oldCreatedAt.getTime()).toEqual(newCreatedAt?.getTime());
      });

      it('returns undefined when the user does not exist', async () => {
        const entity = await repository.transaction(() => repository.update(-1, { email: `${v4()}@example.com` }));
        expect(entity).toBeUndefined();
      });
    });
  });

  describe('updateOrFail', () => {
    it('updates a user entity', async () => {
      const createdEntity = await factory.create({});

      const newEntityValues: Partial<User> = { name: 'updated-name' };

      const updatedEntity = await repository.updateOrFail(createdEntity.id, newEntityValues);
      if (!updatedEntity) fail();

      expect(updatedEntity).toMatchObject(newEntityValues);

      const fetchedEntity = await repository.find(createdEntity.id);
      expect(fetchedEntity).toMatchObject(updatedEntity);
    });

    it('updates the updated-at column', async () => {
      const createdEntity = await factory.create({});

      const oldUpdatedAt = createdEntity.updatedAt;

      const newEntityValues: Partial<User> = { name: 'updated-name' };

      await repository.updateOrFail(createdEntity.id, newEntityValues);
      const fetchedEntity = await repository.find(createdEntity.id);
      if (!fetchedEntity) fail();

      const newUpdatedAt = fetchedEntity.updatedAt as Date;

      expect(newUpdatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
    });

    it('does not update the createdAt value', async () => {
      const createdEntity = await factory.create({});

      const oldCreatedAt = createdEntity.createdAt;

      const newEntityValues: Partial<User> = { createdAt: new Date(0) };
      await repository.updateOrFail(createdEntity.id, newEntityValues);
      const fetchedEntity = await repository.find(createdEntity.id);

      const newCreatedAt = fetchedEntity?.createdAt;

      expect(oldCreatedAt.getTime()).toEqual(newCreatedAt?.getTime());
    });

    it('throws when the user does not exist', async () => {
      const fn = async () => await repository.updateOrFail(-1, { email: `${v4()}@example.com` });
      await expect(fn).rejects.toBeDefined();
    });

    describe('within a transaction', () => {
      it('updates a user entity', async () => {
        const createdEntity = await factory.create({});

        const newEntityValues: Partial<User> = { name: 'updated-name' };

        const updatedEntity = await repository.transaction(() =>
          repository.updateOrFail(createdEntity.id, newEntityValues)
        );
        if (!updatedEntity) fail();

        expect(updatedEntity).toMatchObject(newEntityValues);

        const fetchedEntity = await repository.find(createdEntity.id);
        expect(fetchedEntity).toMatchObject(updatedEntity);
      });

      it('updates the updated-at column', async () => {
        const createdEntity = await factory.create({});

        const oldUpdatedAt = createdEntity.updatedAt;

        const newEntityValues: Partial<User> = { name: 'updated-name' };

        await repository.transaction(() => repository.updateOrFail(createdEntity.id, newEntityValues));
        const fetchedEntity = await repository.find(createdEntity.id);
        if (!fetchedEntity) fail();

        const newUpdatedAt = fetchedEntity.updatedAt as Date;

        expect(newUpdatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      });

      it('does not update the createdAt value', async () => {
        const createdEntity = await factory.create({});

        const oldCreatedAt = createdEntity.createdAt;

        const newEntityValues: Partial<User> = { createdAt: new Date(0) };
        await repository.transaction(() => repository.updateOrFail(createdEntity.id, newEntityValues));
        const fetchedEntity = await repository.find(createdEntity.id);

        const newCreatedAt = fetchedEntity?.createdAt;

        expect(oldCreatedAt.getTime()).toEqual(newCreatedAt?.getTime());
      });

      it('throws when the user does not exist', async () => {
        const fn = async () =>
          await repository.transaction(() => repository.updateOrFail(-1, { email: `${v4()}@example.com` }));
        await expect(fn).rejects.toBeDefined();
      });
    });
  });

  describe('delete', () => {
    it('deletes the entity and returns it', async () => {
      const createdUser = await factory.create({});

      const deletedUser = await repository.delete(createdUser.id);
      expect(deletedUser).toMatchObject(createdUser);

      const fetchedUser = await repository.find(createdUser.id);
      expect(fetchedUser).toBe(undefined);
    });

    it('returns undefined if the user does not exist', async () => {
      const deletedUser = await repository.delete(-1);
      expect(deletedUser).toBeUndefined;
    });

    describe('within a transaction', () => {
      it('deletes the entity and returns it', async () => {
        const createdUser = await factory.create({});

        const deletedUser = await repository.transaction(() => repository.delete(createdUser.id));
        expect(deletedUser).toMatchObject(createdUser);

        const fetchedUser = await repository.find(createdUser.id);
        expect(fetchedUser).toBe(undefined);
      });

      it('returns undefined if the user does not exist', async () => {
        const deletedUser = await repository.transaction(() => repository.delete(-1));
        expect(deletedUser).toBeUndefined;
      });
    });
  });

  describe('deleteOrFail', () => {
    it('deletes the entity and returns it', async () => {
      const createdUser = await factory.create({});

      const deletedUser = await repository.deleteOrFail(createdUser.id);
      expect(deletedUser).toMatchObject(createdUser);

      const fetchedUser = await repository.find(createdUser.id);
      expect(fetchedUser).toBe(undefined);
    });

    it('throws if the user does not exist', async () => {
      const fn = async () => await repository.deleteOrFail(-1);
      await expect(fn).rejects.toBeDefined();
    });

    describe('within a transaction', () => {
      it('deletes the entity and returns it', async () => {
        const createdUser = await factory.create({});

        const deletedUser = await repository.transaction(() => repository.deleteOrFail(createdUser.id));
        expect(deletedUser).toMatchObject(createdUser);

        const fetchedUser = await repository.find(createdUser.id);
        expect(fetchedUser).toBe(undefined);
      });

      it('throws if the user does not exist', async () => {
        const fn = async () => await repository.transaction(() => repository.deleteOrFail(-1));
        await expect(fn).rejects.toBeDefined();
      });
    });
  });
});
