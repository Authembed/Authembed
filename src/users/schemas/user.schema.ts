import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = UserModel & Document;

@Schema({
  minimize: false,
  collection: 'users',
})
export class UserModel {
  _id: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: Date })
  updatedAt?: Date;

  @Prop({ type: Date })
  deletedAt?: Date;

  @Prop({ type: String })
  name?: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: Boolean })
  emailVerified: boolean;

  @Prop({ type: String, required: true })
  passwordHash: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown> | null;

  @Prop({ type: Object })
  privateMetadata?: Record<string, unknown> | null;
}

export const UserSchema = SchemaFactory.createForClass(UserModel);
