import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { StartRegistrationRequestBodyDto } from './dtos/start-registration-request-body.dto';
import { TAuthConfig, AUTH_CONFIG_KEY } from '../config/auth.config';
import { Types } from 'mongoose';
import { Response } from 'express';
import { LoginRequestBodyDto } from './dtos/login-request-body.dto';
import { LocalGuard } from './guards/local.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ApiBody } from '@nestjs/swagger';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(AUTH_CONFIG_KEY)
    private readonly authConfigs: TAuthConfig,
  ) {}

  @Post('api/login')
  @UseGuards(LocalGuard)
  @ApiBody({ type: () => LoginRequestBodyDto })
  async login(
    @CurrentUser() user: UserDocument,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const accessToken = await this.authService.createAccessToken(user._id);

    response.cookie('authembed_access_token', accessToken);

    return {
      accessToken,
      user,
    };
  }

  @Post('api/auth/register')
  async startRegistration(
    @Body() body: StartRegistrationRequestBodyDto,
  ): Promise<any> {
    const { emailVerificationId } = await this.authService.startRegistration(
      body,
    );

    return { emailVerificationId };
  }

  @Get('api/users-by-token/:token')
  async getUserByToken(@Param('token') token: string): Promise<any> {
    return await this.authService.getUserByToken(token);
  }

  @Get('auth/email/verify')
  async verifyEmail(
    @Query('id') id: string,
    @Query('code') code: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<any> {
    const { accessToken } = await this.authService.verifyEmail({
      emailVerificationId: Types.ObjectId.createFromHexString(id),
      verificationCode: code,
    });

    response.cookie('authembed_access_token', accessToken);
    response.redirect(this.authConfigs.registrationSuccessRedirectUrl);
  }
}
