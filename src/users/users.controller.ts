import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminAuthGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { PatchUserRequestBodyDto } from './dtos/patch-user-request-body.dto';
import { UserDocument } from './schemas/user.schema';
import { UsersService } from './users.service';
import { Types } from 'mongoose';
import { GetUsersBatchRequestBody } from './dtos/get-users-batch-request-body.dto';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/api/user')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() currentUser: UserDocument): Promise<UserDocument> {
    return currentUser;
  }

  @Get('/admin-api/users')
  @UseGuards(AdminAuthGuard)
  async getUsers(@Query() query: any): Promise<UserDocument[]> {
    return await this.usersService.getUsers(query);
  }

  @Patch('/admin-api/users/:userId')
  @UseGuards(AdminAuthGuard)
  async patchUsers(
    @Param('userId') userId: string,
    @Body() body: PatchUserRequestBodyDto,
  ): Promise<UserDocument> {
    return await this.usersService.patchUser(
      Types.ObjectId.createFromHexString(userId),
      body,
    );
  }

  @Post('/admin-api/users/get-batch')
  @UseGuards(AdminAuthGuard)
  async getUsersBatch(@Body() body: GetUsersBatchRequestBody): Promise<any> {
    return this.usersService.getUsersBatch(body.ids);
  }
}
