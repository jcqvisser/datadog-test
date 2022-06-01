import { Injectable } from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { UsersRepository } from 'src/database/repositories/users.repository';
import { v4 } from 'uuid';
import { Factory } from './_factory';

@Injectable()
export class UsersFactory extends Factory<User> {
  constructor(usersRepository: UsersRepository) {
    super(usersRepository);
  }
  buildBasicEntity(): Omit<User, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      email: `${v4()}@example.com`,
      name: v4(),
    };
  }
}
