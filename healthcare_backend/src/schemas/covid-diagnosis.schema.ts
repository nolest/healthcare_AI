import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CovidDiagnosisDocument = CovidDiagnosis & Document;

@Schema({ timestamps: true })
export class CovidDiagnosis {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'CovidAssessment', required: true })
  assessmentId: Types.ObjectId;

  @Prop({ required: true })
  diagnosisType: string; // 'covid', 'flu', 'other'

  @Prop({ required: true })
  diagnosis: string; // 诊断结果

  @Prop({ required: true })
  recommendation: string; // 医生建议

  @Prop()
  treatment: string; // 治疗方案

  @Prop()
  followUpDate: Date; // 复诊日期

  @Prop()
  isolationDays: number; // 隔离天数

  @Prop()
  testingRecommendation: string; // 检测建议

  @Prop()
  returnToWorkDate: Date; // 复工日期

  @Prop()
  riskLevel: string; // 医生评估的风险等级

  @Prop()
  urgency: string; // 紧急程度：'low', 'medium', 'high', 'urgent'

  @Prop()
  notes: string; // 医生备注

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'under_review'] })
  status: string; // 诊断状态

  @Prop({ default: false })
  requiresHospitalization: boolean; // 是否需要住院

  @Prop()
  medicationPrescription: string; // 药物处方

  @Prop()
  monitoringInstructions: string; // 监测指示
}

export const CovidDiagnosisSchema = SchemaFactory.createForClass(CovidDiagnosis); 