import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MeasurementDiagnosisDocument = MeasurementDiagnosis & Document;

@Schema({ timestamps: true })
export class MeasurementDiagnosis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Measurement', required: true })
  measurementId: Types.ObjectId;

  @Prop({ required: true })
  diagnosis: string;

  @Prop()
  riskLevel: string; // low, medium, high, critical

  @Prop()
  medications: string; // 用药建议

  @Prop()
  lifestyle: string; // 生活方式建议

  @Prop()
  followUp: string; // 复查建议

  @Prop()
  treatmentPlan: string; // 治疗方案

  @Prop()
  notes: string; // 备注

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'reviewed'] })
  status: string;

  @Prop({ default: false })
  isRead: boolean; // 患者是否已读
}

export const MeasurementDiagnosisSchema = SchemaFactory.createForClass(MeasurementDiagnosis); 