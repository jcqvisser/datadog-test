interface FieldsSetByDatabase {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Repo<TEntity> {
  createOrFail: (
    entity: Partial<Omit<TEntity, keyof FieldsSetByDatabase>>,
  ) => Promise<TEntity>;
}

export abstract class Factory<
  TEntity extends FieldsSetByDatabase & TDatabaseRequiredProperties,
  TDatabaseRequiredProperties extends Partial<TEntity> = Partial<TEntity>,
> {
  constructor(public readonly repo: Repo<TEntity>) {}

  abstract buildBasicEntity(): Omit<
    TEntity,
    'id' | 'createdAt' | 'updatedAt' | keyof TDatabaseRequiredProperties
  >;

  async create(
    entity: Partial<Omit<TEntity, 'id' | 'createdAt' | 'updatedAt'>> &
      TDatabaseRequiredProperties,
  ): Promise<TEntity> {
    const userToCreate = {
      ...this.buildBasicEntity(),
      ...entity,
      id: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };
    const user = await this.repo.createOrFail(userToCreate);
    return user;
  }
}
