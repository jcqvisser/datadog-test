import { Injectable } from '@nestjs/common';
import { User } from 'src/database/entities/user.entity';
import { UsersRepository } from 'src/database/repositories/users.repository';
import { UserCreateRequest } from '../models/user-create-request.model';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async createOrFail(request: UserCreateRequest): Promise<User> {
    return await this.usersRepository.createOrFail(request);
  }
}
