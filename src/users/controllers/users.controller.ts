import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { UserCreateRequest } from '../models/user-create-request.model';
import { UserCreateResponse } from '../models/user-create-response.model';
import { UsersService } from '../services/users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiResponse({ type: UserCreateResponse })
  async create(
    @Body() request: UserCreateRequest,
  ): Promise<UserCreateResponse> {
    const user = await this.usersService.createOrFail(request);
    return plainToInstance(UserCreateResponse, user);
  }
}
