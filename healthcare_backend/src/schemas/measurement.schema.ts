import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeasurementDocument = Measurement & Document;

@Schema({ timestamps: true })
export class Measurement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  systolic: number;

  @Prop({ required: true })
  diastolic: number;

  @Prop({ required: true })
  heartRate: number;

  @Prop({ required: true })
  temperature: number;

  @Prop({ required: true })
  oxygenSaturation: number;

  @Prop()
  notes: string;

  @Prop({ default: 'pending', enum: ['pending', 'processed', 'reviewed'] })
  status: string;

  @Prop({ default: false })
  isAbnormal: boolean;

  @Prop()
  measurementTime: Date;
}

export const MeasurementSchema = SchemaFactory.createForClass(Measurement); 