import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminAuthGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/api/user')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() currentUser: UserDocument): Promise<UserDocument> {
    return currentUser;
  }

  @Get('/api/users')
  @UseGuards(AdminAuthGuard)
  async getUsers(@Query() query: any): Promise<UserDocument[]> {
    return await this.usersService.getUsers(query);
  }
}
