import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeasurementDocument = Measurement & Document;

@Schema({ timestamps: true })
export class Measurement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop()
  systolic?: number;

  @Prop()
  diastolic?: number;

  @Prop()
  heartRate?: number;

  @Prop()
  temperature?: number;

  @Prop()
  oxygenSaturation?: number;

  @Prop()
  notes: string;

  @Prop({ type: [String], default: [] })
  imagePaths: string[]; // 患者上传的图片路径列表

  @Prop({ default: 'pending', enum: ['pending', 'processed', 'reviewed'] })
  status: string;

  @Prop({ default: false })
  isAbnormal: boolean;

  @Prop({ type: [String], default: [] })
  abnormalReasons: string[]; // 异常原因列表

  @Prop({ default: 'normal', enum: ['normal', 'low', 'high', 'severeLow', 'severeHigh', 'critical'] })
  severity: string; // 异常严重程度

  @Prop()
  measurementTime: Date;
}

export const MeasurementSchema = SchemaFactory.createForClass(Measurement); 