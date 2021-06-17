import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailVerificationModel,
  EmailVerificationSchema,
} from './schemas/email-verification.schema';
import { JwtModule } from '@nestjs/jwt';
import { TAuthConfig, AUTH_CONFIG_KEY } from '../config/auth.config';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserModel, UserSchema } from '../users/schemas/user.schema';
import { LocalStrategy } from './strategies/local.strategy';
import { TriggersModule } from '../triggers/triggers.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => TriggersModule),
    MongooseModule.forFeature([
      { name: EmailVerificationModel.name, schema: EmailVerificationSchema },
      { name: UserModel.name, schema: UserSchema },
    ]),
    JwtModule.registerAsync({
      useFactory: (authConfig: TAuthConfig) => ({
        secret: authConfig.jwtSecret,
      }),
      inject: [AUTH_CONFIG_KEY],
    }),
  ],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
