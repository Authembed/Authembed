import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { configModuleOptions } from '../config';
import {
  MongoDBConfigType,
  MONGODB_CONFIG_KEY,
} from '../config/mongodb.config';
import { UsersModule } from '../users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EMAIL_CONFIGS_KEY, TEmailConfigs } from '../config/email.config';
import appRootPath from 'app-root-path';
import path from 'path';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ConfigModule.forRoot(configModuleOptions),
    MongooseModule.forRootAsync({
      useFactory: (mongodbConfig: MongoDBConfigType) => ({
        uri: mongodbConfig.uri,
      }),
      inject: [MONGODB_CONFIG_KEY],
    }),
    MailerModule.forRootAsync({
      useFactory: (emailConfigs: TEmailConfigs) => ({
        transport: emailConfigs.smtpUri,
        defaults: {
          from: emailConfigs.emailFrom,
        },
        template: {
          dir: path.join(appRootPath.toString(), 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [EMAIL_CONFIGS_KEY],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
