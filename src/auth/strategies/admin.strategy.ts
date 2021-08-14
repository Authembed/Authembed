import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy } from 'passport-http';
import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import secureCompare from 'secure-compare';
import { TAuthConfig, AUTH_CONFIG_KEY } from '../../config/auth.config';
import { Admin } from '../classes/admin.class';

@Injectable()
export class AdminStrategy extends PassportStrategy(BasicStrategy, 'admin') {
  constructor(
    @Inject(AUTH_CONFIG_KEY)
    private readonly authConfig: TAuthConfig,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<Admin> {
    if (!secureCompare(password, this.authConfig.adminPassword)) {
      throw new UnauthorizedException();
    }

    return new Admin();
  }
}
