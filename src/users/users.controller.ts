import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() currentUser: UserDocument): Promise<UserDocument> {
    return currentUser;
  }
}
