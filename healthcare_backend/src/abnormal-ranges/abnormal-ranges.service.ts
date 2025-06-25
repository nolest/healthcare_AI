import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AbnormalRange, AbnormalRangeDocument } from '../schemas/abnormal-range.schema';
import { CreateAbnormalRangeDto, UpdateAbnormalRangeDto } from '../dto/abnormal-range.dto';

@Injectable()
export class AbnormalRangesService {
  constructor(
    @InjectModel(AbnormalRange.name) private abnormalRangeModel: Model<AbnormalRangeDocument>,
  ) {
    // 在构造函数中初始化
    this.initializeDefaultRanges();
  }

  async initializeDefaultRanges() {
    const existingRanges = await this.abnormalRangeModel.countDocuments();
    if (existingRanges === 0) {
      const defaultRanges = [
        {
          measurementType: 'blood_pressure',
          name: '血压',
          normalRange: {
            systolic: { min: 90, max: 140 },
            diastolic: { min: 60, max: 90 }
          },
          unit: 'mmHg',
          description: '收缩压和舒张压的正常范围'
        },
        {
          measurementType: 'heart_rate',
          name: '心率',
          normalRange: {
            heartRate: { min: 60, max: 100 }
          },
          unit: 'bpm',
          description: '成人静息心率正常范围'
        },
        {
          measurementType: 'temperature',
          name: '体温',
          normalRange: {
            temperature: { min: 36.1, max: 37.2 }
          },
          unit: '°C',
          description: '成人正常体温范围'
        },
        {
          measurementType: 'oxygen_saturation',
          name: '血氧饱和度',
          normalRange: {
            oxygenSaturation: { min: 95, max: 100 }
          },
          unit: '%',
          description: '血氧饱和度正常范围'
        },
        {
          measurementType: 'blood_glucose',
          name: '血糖',
          normalRange: {
            bloodGlucose: { min: 70, max: 140 }
          },
          unit: 'mg/dL',
          description: '空腹血糖正常范围'
        }
      ];

      await this.abnormalRangeModel.insertMany(defaultRanges);
      console.log('已初始化默认异常值范围设置');
    }
  }

  async create(createAbnormalRangeDto: CreateAbnormalRangeDto, userId: string) {
    const abnormalRange = new this.abnormalRangeModel({
      ...createAbnormalRangeDto,
      lastModifiedBy: userId,
      lastModifiedAt: new Date()
    });
    return abnormalRange.save();
  }

  async findAll() {
    return this.abnormalRangeModel.find({ isActive: true }).sort({ measurementType: 1 }).exec();
  }

  async findOne(id: string) {
    const abnormalRange = await this.abnormalRangeModel.findById(id).exec();
    if (!abnormalRange) {
      throw new NotFoundException('异常值范围设置不存在');
    }
    return abnormalRange;
  }

  async findByMeasurementType(measurementType: string) {
    return this.abnormalRangeModel.findOne({ 
      measurementType, 
      isActive: true 
    }).exec();
  }

  async update(id: string, updateAbnormalRangeDto: UpdateAbnormalRangeDto, userId: string) {
    const abnormalRange = await this.abnormalRangeModel.findByIdAndUpdate(
      id,
      {
        ...updateAbnormalRangeDto,
        lastModifiedBy: userId,
        lastModifiedAt: new Date()
      },
      { new: true }
    ).exec();

    if (!abnormalRange) {
      throw new NotFoundException('异常值范围设置不存在');
    }

    return abnormalRange;
  }

  async remove(id: string) {
    const abnormalRange = await this.abnormalRangeModel.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();

    if (!abnormalRange) {
      throw new NotFoundException('异常值范围设置不存在');
    }

    return abnormalRange;
  }

  // 检查测量值是否异常
  async checkMeasurementAbnormal(measurementType: string, values: any): Promise<{ isAbnormal: boolean; reasons: string[] }> {
    const range = await this.findByMeasurementType(measurementType);
    if (!range) {
      return { isAbnormal: false, reasons: [] };
    }

    const reasons: string[] = [];
    let isAbnormal = false;

    switch (measurementType) {
      case 'blood_pressure':
        if (values.systolic && range.normalRange.systolic) {
          if (values.systolic < range.normalRange.systolic.min) {
            reasons.push(`收缩压过低 (${values.systolic} < ${range.normalRange.systolic.min})`);
            isAbnormal = true;
          } else if (values.systolic > range.normalRange.systolic.max) {
            reasons.push(`收缩压过高 (${values.systolic} > ${range.normalRange.systolic.max})`);
            isAbnormal = true;
          }
        }
        if (values.diastolic && range.normalRange.diastolic) {
          if (values.diastolic < range.normalRange.diastolic.min) {
            reasons.push(`舒张压过低 (${values.diastolic} < ${range.normalRange.diastolic.min})`);
            isAbnormal = true;
          } else if (values.diastolic > range.normalRange.diastolic.max) {
            reasons.push(`舒张压过高 (${values.diastolic} > ${range.normalRange.diastolic.max})`);
            isAbnormal = true;
          }
        }
        break;

      case 'heart_rate':
        if (values.rate && range.normalRange.heartRate) {
          if (values.rate < range.normalRange.heartRate.min) {
            reasons.push(`心率过低 (${values.rate} < ${range.normalRange.heartRate.min})`);
            isAbnormal = true;
          } else if (values.rate > range.normalRange.heartRate.max) {
            reasons.push(`心率过高 (${values.rate} > ${range.normalRange.heartRate.max})`);
            isAbnormal = true;
          }
        }
        break;

      case 'temperature':
        if (values.celsius && range.normalRange.temperature) {
          if (values.celsius < range.normalRange.temperature.min) {
            reasons.push(`体温过低 (${values.celsius} < ${range.normalRange.temperature.min})`);
            isAbnormal = true;
          } else if (values.celsius > range.normalRange.temperature.max) {
            reasons.push(`体温过高 (${values.celsius} > ${range.normalRange.temperature.max})`);
            isAbnormal = true;
          }
        }
        break;

      case 'oxygen_saturation':
        if (values.percentage && range.normalRange.oxygenSaturation) {
          if (values.percentage < range.normalRange.oxygenSaturation.min) {
            reasons.push(`血氧饱和度过低 (${values.percentage} < ${range.normalRange.oxygenSaturation.min})`);
            isAbnormal = true;
          } else if (values.percentage > range.normalRange.oxygenSaturation.max) {
            reasons.push(`血氧饱和度过高 (${values.percentage} > ${range.normalRange.oxygenSaturation.max})`);
            isAbnormal = true;
          }
        }
        break;

      case 'blood_glucose':
        if (values.mg_dl && range.normalRange.bloodGlucose) {
          if (values.mg_dl < range.normalRange.bloodGlucose.min) {
            reasons.push(`血糖过低 (${values.mg_dl} < ${range.normalRange.bloodGlucose.min})`);
            isAbnormal = true;
          } else if (values.mg_dl > range.normalRange.bloodGlucose.max) {
            reasons.push(`血糖过高 (${values.mg_dl} > ${range.normalRange.bloodGlucose.max})`);
            isAbnormal = true;
          }
        }
        break;
    }

    return { isAbnormal, reasons };
  }
} 