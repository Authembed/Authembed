import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { appConfigsFactory } from './app.config';
import { authConfig } from './auth.config';
import { emailConfigsFactory } from './email.config';
import { mongodbConfig } from './mongodb.config';

export const configModuleOptions: ConfigModuleOptions = {
  load: [appConfigsFactory, mongodbConfig, authConfig, emailConfigsFactory],
  isGlobal: true,
};
