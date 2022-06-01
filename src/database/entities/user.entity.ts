export class UserMetadata {
  static tableName = 'users';
  static columns = [
    'users.id',
    'users.email',
    'users.name',
    'users.createdAt',
    'users.updatedAt',
  ];

  static id: 'users.id' = 'users.id';
  static email: 'users.email' = 'users.email';
  static nameColumn: 'users.name' = 'users.name';
  static createdAt: 'users.createdAt' = 'users.createdAt';
  static updatedAt: 'users.updatedAt' = 'users.updatedAt';
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserToCreate {
  email: string;
  name: string;
}
