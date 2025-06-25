import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, enum: ['patient', 'medical_staff'] })
  role: string;

  @Prop()
  phone: string;

  @Prop()
  birthDate: string;

  @Prop({ enum: ['male', 'female', 'other'] })
  gender: string;

  // 医护人员专用字段
  @Prop()
  department: string;

  @Prop()
  license_number: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 