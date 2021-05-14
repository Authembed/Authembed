import { ConfigType, registerAs } from '@nestjs/config';

export const emailConfigsFactory = registerAs('email', () => ({
  smtpUri: process.env.SMTP_URI,
  emailFrom: process.env.EMAIL_FROM,
}));

export const EMAIL_CONFIGS_KEY = emailConfigsFactory.KEY;

export type TEmailConfigs = ConfigType<typeof emailConfigsFactory>;
