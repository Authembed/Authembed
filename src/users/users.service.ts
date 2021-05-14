import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    name: string;
  }): Promise<UserDocument> {
    const user = await this.userModel.create({
      email: data.email,
      passwordHash: data.passwordHash,
      name: data.name,
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
}
