import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  EmailVerificationDocument,
  EmailVerificationModel,
} from './schemas/email-verification.schema';
import cryptoRandomString from 'crypto-random-string';
import { MailerService } from '@nestjs-modules/mailer';
import { APP_CONFIGS_KEY, TAppConfigs } from '../config/app.config';
import { StartRegistrationRequestBodyDto } from './dtos/start-registration-request-body.dto';
import bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserDocument, UserModel } from '../users/schemas/user.schema';
import { ErrorGenerator } from '../common/classes/error-generator.class';
import { TriggersService } from '../triggers/triggers.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EmailVerificationModel.name)
    private readonly emailVerificationModel: Model<EmailVerificationDocument>,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    @Inject(forwardRef(() => TriggersService))
    private readonly triggersService: TriggersService,
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async registerWithLazyEmailVerification(
    body: StartRegistrationRequestBodyDto,
  ): Promise<{ accessToken: string; user: UserDocument }> {
    if (await this.usersService.isEmailTaken(body.email)) {
      throw ErrorGenerator.create('EMAIL_TAKEN');
    }

    const user = await this.usersService.createUser({
      email: body.email,
      name: body.name,
      passwordHash: await bcrypt.hash(body.password, 10),
      emailVerified: false,
      metadata: body.metadata,
    });

    await this.sendVerificationEmailForAlreadyRegisteredUser(
      user.id,
      user.email,
    ).catch((err) => {
      console.error(err);
    });

    await this.triggersService.runTriggersOnUserRegistered(user);

    const accessToken = await this.createAccessToken(user._id);

    return {
      accessToken,
      user,
    };
  }

  async registerWithEmailVerification(
    body: StartRegistrationRequestBodyDto,
  ): Promise<{ emailVerificationId: Types.ObjectId }> {
    if (await this.usersService.isEmailTaken(body.email)) {
      throw ErrorGenerator.create('EMAIL_TAKEN');
    }

    return await this.sendVerificationEmailWithRegistration(body);
  }

  private async sendVerificationEmailForAlreadyRegisteredUser(
    userId: Types.ObjectId,
    email: string,
  ): Promise<void> {
    const emailVerification = await this.emailVerificationModel.create({
      createdAt: new Date(),
      verificationCode: cryptoRandomString({ type: 'numeric', length: 6 }),
      status: 'PENDING',
      attempts: 0,
      email: email,
      user: userId,
      alreadyRegistered: true,
    });

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Подтверждение почты',
        template: './email-verification',
        context: {
          confirmationUrl:
            this.appConfigs.baseUrl +
            '/auth/email/verify?id=' +
            emailVerification._id +
            '&code=' +
            emailVerification.verificationCode,
        },
      })
      .catch((err) => {
        console.error({ err });

        throw err;
      });
  }

  private async sendVerificationEmailWithRegistration(
    body: StartRegistrationRequestBodyDto,
  ): Promise<{ emailVerificationId: Types.ObjectId }> {
    const emailVerification = await this.emailVerificationModel.create({
      createdAt: new Date(),
      verificationCode: cryptoRandomString({ type: 'numeric', length: 6 }),
      status: 'PENDING',
      attempts: 0,
      email: body.email,
      registrationData: {
        email: body.email,
        name: body.name,
        passwordHash: await bcrypt.hash(body.password, 10),
        metadata: body.metadata,
      },
    });

    await this.mailerService
      .sendMail({
        to: body.email,
        subject: 'Подтверждение почты',
        template: './email-verification',
        context: {
          confirmationUrl:
            this.appConfigs.baseUrl +
            '/auth/email/verify-and-register?id=' +
            emailVerification._id +
            '&code=' +
            emailVerification.verificationCode,
        },
      })
      .catch((err) => {
        console.error({ err });

        throw err;
      });

    return { emailVerificationId: emailVerification._id };
  }

  async verifyEmail(params: {
    emailVerificationId: Types.ObjectId;
    verificationCode: string;
  }): Promise<void> {
    const emailVerification = await this.emailVerificationModel.findOne({
      _id: params.emailVerificationId,
    });

    if (!emailVerification.alreadyRegistered || !emailVerification.user) {
      throw new BadRequestException();
    }

    if (!emailVerification) {
      // TODO: redirect to error page
      throw new BadRequestException();
    }

    if (emailVerification.status !== 'PENDING') {
      throw new BadRequestException();
    }

    if (emailVerification.attempts >= 3) {
      throw new BadRequestException();
    }

    if (emailVerification.verificationCode !== params.verificationCode) {
      emailVerification.attempts += 1;
      if (emailVerification.attempts >= 3) {
        emailVerification.status = 'FAILED';
      }

      await emailVerification.save();

      throw new BadRequestException();
    }

    emailVerification.status = 'SUCCESS';

    await emailVerification.save();

    const user = await this.userModel.findOne(emailVerification.user);
    user.emailVerified = true;

    await user.save();
  }

  async verifyEmailAndRegister(params: {
    emailVerificationId: Types.ObjectId;
    verificationCode: string;
  }): Promise<{ accessToken: string }> {
    const emailVerification = await this.emailVerificationModel.findOne({
      _id: params.emailVerificationId,
    });

    if (emailVerification.alreadyRegistered || emailVerification.user) {
      throw new BadRequestException();
    }

    if (!emailVerification) {
      // TODO: redirect to error page
      throw new BadRequestException();
    }

    if (emailVerification.status !== 'PENDING') {
      throw new BadRequestException();
    }

    if (emailVerification.attempts >= 3) {
      throw new BadRequestException();
    }

    if (emailVerification.verificationCode !== params.verificationCode) {
      emailVerification.attempts += 1;
      if (emailVerification.attempts >= 3) {
        emailVerification.status = 'FAILED';
      }

      await emailVerification.save();

      throw new BadRequestException();
    }

    emailVerification.status = 'SUCCESS';

    await emailVerification.save();

    const user = await this.usersService.createUser(
      emailVerification.registrationData,
    );

    await this.triggersService.runTriggersOnUserRegistered(user);

    const accessToken = await this.createAccessToken(user._id);

    return { accessToken };
  }

  async createAccessToken(userId: Types.ObjectId): Promise<string> {
    const token = await this.jwtService.signAsync({ sub: userId });

    return token;
  }

  async getUserByToken(token: string): Promise<UserDocument> {
    const tokenPayload = await this.jwtService.verifyAsync(token);

    const userId = Types.ObjectId.createFromHexString(tokenPayload.sub);

    return await this.usersService.getUserById(userId);
  }

  async validateUser(creds: {
    email: string;
    password: string;
  }): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      email: creds.email,
    });

    if (!(await bcrypt.compare(creds.password, user.passwordHash))) {
      return null;
    }

    return user;
  }
}
