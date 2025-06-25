import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DiagnosisDocument = Diagnosis & Document;

@Schema({ timestamps: true })
export class Diagnosis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Measurement', required: true })
  measurementId: Types.ObjectId;

  @Prop({ required: true })
  diagnosis: string;

  @Prop({ required: true })
  treatment: string;

  @Prop()
  followUpDate: Date;

  @Prop()
  notes: string;

  @Prop({ default: 'active', enum: ['active', 'completed', 'cancelled'] })
  status: string;
}

export const DiagnosisSchema = SchemaFactory.createForClass(Diagnosis); 