import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CovidAssessmentDocument = CovidAssessment & Document;

@Schema({ timestamps: true })
export class CovidAssessment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  symptoms: string[];

  @Prop({ required: true })
  severity: string;

  @Prop({ required: true })
  riskLevel: string;

  @Prop({ required: true })
  recommendations: string[];

  @Prop()
  exposureHistory: boolean;

  @Prop()
  travelHistory: boolean;

  @Prop()
  contactHistory: boolean;

  @Prop()
  vaccinationStatus: string;

  @Prop()
  testResults: string;

  @Prop()
  notes: string;
}

export const CovidAssessmentSchema = SchemaFactory.createForClass(CovidAssessment); 