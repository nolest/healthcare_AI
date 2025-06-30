import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CovidAssessmentDocument = CovidAssessment & Document;

@Schema({ timestamps: true })
export class CovidAssessment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, default: 'covid' })
  assessmentType: string; // 'covid' or 'flu'

  @Prop({ required: true })
  symptoms: string[];

  @Prop()
  riskFactors: string[];

  @Prop()
  temperature: number;

  @Prop()
  symptomOnset: string;

  @Prop()
  exposureHistory: string;

  @Prop()
  travelHistory: string;

  @Prop()
  contactHistory: string;

  @Prop()
  additionalNotes: string;

  @Prop({ required: true })
  riskScore: number;

  @Prop({ required: true })
  riskLevel: string;

  @Prop()
  riskLevelLabel: string;

  @Prop({ type: Object })
  recommendations: any;

  // 保留旧字段以兼容性
  @Prop()
  severity: string;

  @Prop()
  vaccinationStatus: string;

  @Prop()
  testResults: string;

  @Prop()
  notes: string;
}

export const CovidAssessmentSchema = SchemaFactory.createForClass(CovidAssessment); 