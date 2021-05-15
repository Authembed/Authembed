import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Document, Types } from 'mongoose';

export type EmailVerificationDocument = EmailVerificationModel & Document;

@Schema({
  minimize: false,
  collection: 'email_verifications',
})
export class EmailVerificationModel {
  _id: Types.ObjectId;

  @Prop({ type: Date })
  createdAt: Date;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel',
    required: false,
  })
  user?: Types.ObjectId;

  @Prop({ type: String, required: true })
  verificationCode: string;

  @Prop({ type: Number, required: true })
  attempts: number;

  @Prop({ type: String, required: true })
  status: 'SUCCESS' | 'FAILED' | 'PENDING';

  @Prop({ type: Boolean })
  alreadyRegistered?: boolean;

  @Prop({ type: Object })
  registrationData?: {
    email: string;
    passwordHash: string;
    name: string;
    metadata?: Record<string, unknown> | null;
  };
}

export const EmailVerificationSchema = SchemaFactory.createForClass(
  EmailVerificationModel,
);
