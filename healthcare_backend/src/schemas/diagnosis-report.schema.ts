import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DiagnosisReportDocument = DiagnosisReport & Document;

@Schema({ timestamps: true })
export class DiagnosisReport {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  patientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  doctorId: Types.ObjectId;

  @Prop({ required: true, enum: ['measurement', 'covid_flu'] })
  reportType: string; // 'measurement' 或 'covid_flu'

  @Prop({ type: Types.ObjectId, refPath: 'sourceModel' })
  sourceId: Types.ObjectId; // 关联的源数据ID

  @Prop({ required: true, enum: ['Measurement', 'CovidAssessment'] })
  sourceModel: string; // 源数据模型名称

  @Prop({ required: true })
  diagnosis: string; // 诊断结果

  @Prop({ required: true })
  recommendation: string; // 医生建议

  @Prop()
  treatment: string; // 治疗方案

  @Prop()
  followUpDate: Date; // 复诊日期

  @Prop()
  urgency: string; // 紧急程度：'low', 'medium', 'high', 'urgent'

  @Prop()
  notes: string; // 医生备注

  @Prop({ default: 'pending', enum: ['pending', 'completed', 'under_review'] })
  status: string; // 诊断状态

  @Prop({ default: false })
  isRead: boolean; // 患者是否已读

  @Prop()
  readAt: Date; // 阅读时间

  // COVID/流感特有字段
  @Prop()
  isolationDays: number; // 隔离天数

  @Prop()
  testingRecommendation: string; // 检测建议

  @Prop()
  returnToWorkDate: Date; // 复工日期

  @Prop({ default: false })
  requiresHospitalization: boolean; // 是否需要住院

  @Prop()
  medicationPrescription: string; // 药物处方

  @Prop()
  monitoringInstructions: string; // 监测指示

  // 源数据快照（用于显示患者填入的指标）
  @Prop({ type: Object })
  sourceDataSnapshot: any;
}

export const DiagnosisReportSchema = SchemaFactory.createForClass(DiagnosisReport); 