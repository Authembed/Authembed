import { registerAs, ConfigType } from '@nestjs/config';

export const authConfig = registerAs('auth', () => ({
  jwtSecret: process.env.JWT_SECRET,
  registrationSuccessRedirectUrl: process.env.REGISTRATION_SUCCESS_REDIRECT_URL,
}));

export const AUTH_CONFIG_KEY = authConfig.KEY;

export type TAuthConfig = ConfigType<typeof authConfig>;
