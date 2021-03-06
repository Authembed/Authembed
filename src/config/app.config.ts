import { ConfigType, registerAs } from '@nestjs/config';

export const appConfigsFactory = registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000'),
  host: process.env.HOST || 'localhost',
  baseUrl: process.env.BASE_URL,
  version: '0.1',

  uniqueMetadataFields: JSON.parse(
    process.env.UNIQUE_METADATA_FIELDS || '[]',
  ) as string[],
}));

export const APP_CONFIGS_KEY = appConfigsFactory.KEY;

export type TAppConfigs = ConfigType<typeof appConfigsFactory>;
