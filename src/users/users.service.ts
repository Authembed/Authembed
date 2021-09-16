import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PatchUserRequestBodyDto } from './dtos/patch-user-request-body.dto';
import { UserDocument, UserModel } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  public async createUser(data: {
    email: string;
    passwordHash: string;
    name?: string;
    emailVerified?: boolean;
    metadata?: Record<string, unknown> | null;
    privateMetadata?: Record<string, unknown> | null;
  }): Promise<UserDocument> {
    const user = await this.userModel.create({
      email: data.email.toLocaleLowerCase(),
      passwordHash: data.passwordHash,
      name: data.name,
      emailVerified: data.emailVerified,
      metadata: data.metadata,
      privateMetadata: data.privateMetadata,
    });

    return user;
  }

  public async getUserById(id: Types.ObjectId): Promise<UserDocument> {
    return await this.userModel.findById(id);
  }

  async getUserByIdOrFail(userId: Types.ObjectId): Promise<UserDocument> {
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) {
      throw new Error(`User not found with id ${userId}`);
    }

    return user;
  }

  async isEmailTaken(email: string): Promise<boolean> {
    return !!(await this.userModel.countDocuments({
      email: email.toLocaleLowerCase(),
    }));
  }

  async patchUser(
    userId: Types.ObjectId,
    requestBody: PatchUserRequestBodyDto,
  ): Promise<UserDocument> {
    const user = await this.userModel.findOne({
      _id: userId,
    });

    if (requestBody.email.toLocaleLowerCase()) {
      user.email = requestBody.email.toLocaleLowerCase();
    }

    if (requestBody.name) {
      user.name = requestBody.name;
    }

    if (requestBody.email) {
      user.email = requestBody.email.toLocaleLowerCase();
    }

    if (requestBody.metadata) {
      user.metadata = requestBody.metadata;
    }

    if (requestBody.privateMetadata) {
      user.privateMetadata = requestBody.privateMetadata;
    }

    await user.save();

    return user;
  }

  async getUsers(query: any): Promise<UserDocument[]> {
    return await this.userModel.find(query).exec();
  }

  async getUsersBatch(ids: string[]): Promise<Record<string, UserDocument>> {
    const result: Record<string, UserDocument> = {};

    const users = await this.userModel.find({
      _id: { $in: ids },
    });

    users.forEach((user) => {
      result[user._id.toString()] = user;
    });

    return result;
  }
}
