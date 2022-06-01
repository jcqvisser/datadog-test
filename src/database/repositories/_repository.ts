import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Knex } from '../providers/knex';

export const Repository = <
  Entity extends { id: number; createdAt: Date; updatedAt: Date },
>(entityMetadata: {
  tableName: string;
  columns: string[];
}) => {
  return class {
    constructor(public readonly knex: Knex) {}

    async find(
      id: number,
      trx?: Knex.Transaction,
    ): Promise<Entity | undefined> {
      const query = this.knex
        .select(entityMetadata.columns)
        .from(entityMetadata.tableName)
        .where({ id })
        .limit(1);
      const result = await this.execQueryWithOptionalTransaction(trx, query);
      return result?.[0] as Entity;
    }

    async findOrFail(id: number, trx?: Knex.Transaction): Promise<Entity> {
      const entity = await this.find(id, trx);
      if (!entity) throw new NotFoundException();
      return entity;
    }

    async create(
      entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>,
      trx?: Knex.Transaction,
    ): Promise<Entity | undefined> {
      try {
        return await this.createOrFail(entity, trx);
      } catch (e) {
        return undefined;
      }
    }

    async createOrFail(
      entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>,
      trx?: Knex.Transaction,
    ): Promise<Entity> {
      const query = this.knex
        .insert(entity)
        .into(entityMetadata.tableName)
        .returning(entityMetadata.columns);
      const result = await this.execQueryWithOptionalTransaction(trx, query);
      const createdEntity = result?.[0] as Entity;
      if (!createdEntity) throw new BadRequestException();
      return createdEntity;
    }

    async update(
      id: number,
      entity: Partial<Entity>,
      trx?: Knex.Transaction,
    ): Promise<Entity | undefined> {
      const entityWithUpdatedAt = { ...entity, updatedAt: new Date() };
      delete entityWithUpdatedAt.id;
      delete entityWithUpdatedAt.createdAt;

      const query = this.knex(entityMetadata.tableName)
        .where({ id })
        .update(entityWithUpdatedAt)
        .returning(entityMetadata.columns);

      const result = await this.execQueryWithOptionalTransaction(trx, query);
      return result?.[0] as Entity;
    }

    async updateOrFail(
      id: number,
      entity: Partial<Entity>,
      trx?: Knex.Transaction,
    ): Promise<Entity> {
      const result = await this.update(id, entity, trx);
      if (!result) throw new BadRequestException();
      return result;
    }

    async delete(
      id: number,
      trx?: Knex.Transaction,
    ): Promise<Entity | undefined> {
      const query = this.knex(entityMetadata.tableName)
        .delete()
        .where({ id })
        .returning(entityMetadata.columns);
      const result = await this.execQueryWithOptionalTransaction(trx, query);
      return result?.[0] as Entity;
    }

    async deleteOrFail(id: number, trx?: Knex.Transaction): Promise<Entity> {
      const result = await this.delete(id, trx);
      if (!result) throw new BadRequestException();
      return result;
    }

    async execQueryWithOptionalTransaction<T>(
      trx: Knex.Transaction | undefined,
      query: Knex.QueryBuilder<Record<string, unknown>, Partial<unknown>[]>,
    ): Promise<T[] | undefined>;
    async execQueryWithOptionalTransaction<T>(
      trx: Knex.Transaction | undefined,
      query: Knex.QueryBuilder,
    ): Promise<T | undefined> {
      return trx ? await query.transacting(trx) : await query;
    }

    async withTransaction<T>(
      trx: Knex.Transaction | undefined,
      behavior: (config: Knex.Transaction) => Promise<T>,
    ): Promise<T> {
      return trx ? await behavior(trx) : await this.knex.transaction(behavior);
    }

    async transaction<T>(
      behavior: (config: Knex.Transaction) => Promise<T>,
    ): Promise<T> {
      return await this.knex.transaction(behavior);
    }
  };
};
