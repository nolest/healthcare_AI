import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AbnormalRangeDocument = AbnormalRange & Document;

@Schema({ timestamps: true })
export class AbnormalRange {
  @Prop({ required: true, unique: true })
  measurementType: string; // blood_pressure, heart_rate, temperature, oxygen_saturation, blood_glucose

  @Prop({ required: true })
  name: string; // 显示名称

  @Prop({ type: Object, required: true })
  normalRange: {
    // 血压
    systolic?: { min: number; max: number };
    diastolic?: { min: number; max: number };
    // 心率
    heartRate?: { min: number; max: number };
    // 体温
    temperature?: { min: number; max: number };
    // 血氧饱和度
    oxygenSaturation?: { min: number; max: number };
    // 血糖
    bloodGlucose?: { min: number; max: number };
  };

  @Prop({ type: Object })
  abnormalRanges?: {
    // 血压异常范围
    systolic?: {
      critical?: { min: number; max: number };
      severeHigh?: { min: number; max: number };
      high?: { min: number; max: number };
      low?: { min: number; max: number };
      severeLow?: { min: number; max: number };
    };
    diastolic?: {
      critical?: { min: number; max: number };
      severeHigh?: { min: number; max: number };
      high?: { min: number; max: number };
      low?: { min: number; max: number };
      severeLow?: { min: number; max: number };
    };
    // 心率异常范围
    heartRate?: {
      critical?: { min: number; max: number };
      severeHigh?: { min: number; max: number };
      high?: { min: number; max: number };
      low?: { min: number; max: number };
      severeLow?: { min: number; max: number };
    };
    // 体温异常范围
    temperature?: {
      critical?: { min: number; max: number };
      severeHigh?: { min: number; max: number };
      high?: { min: number; max: number };
      low?: { min: number; max: number };
      severeLow?: { min: number; max: number };
    };
    // 血氧饱和度异常范围
    oxygenSaturation?: {
      critical?: { min: number; max: number };
      severeHigh?: { min: number; max: number };
      high?: { min: number; max: number };
      low?: { min: number; max: number };
      severeLow?: { min: number; max: number };
    };
    // 血糖异常范围
    bloodGlucose?: {
      critical?: { min: number; max: number };
      severeHigh?: { min: number; max: number };
      high?: { min: number; max: number };
      low?: { min: number; max: number };
      severeLow?: { min: number; max: number };
    };
  };

  @Prop({ required: true })
  unit: string; // 单位

  @Prop()
  description?: string; // 描述

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastModifiedBy?: string; // 最后修改人员ID

  @Prop()
  lastModifiedAt?: Date;
}

export const AbnormalRangeSchema = SchemaFactory.createForClass(AbnormalRange); 