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
    console.log('🎯 創建異常範圍:', createAbnormalRangeDto);
    
    // 檢查是否已存在相同類型的記錄
    const existing = await this.abnormalRangeModel.findOne({ 
      measurementType: createAbnormalRangeDto.measurementType 
    });
    
    if (existing) {
      console.log('📝 記錄已存在，執行更新:', existing._id);
      return this.update(existing._id.toString(), createAbnormalRangeDto, userId);
    }
    
    const abnormalRange = new this.abnormalRangeModel({
      ...createAbnormalRangeDto,
      lastModifiedBy: userId,
      lastModifiedAt: new Date()
    });
    
    const saved = await abnormalRange.save();
    console.log('✅ 創建成功:', saved);
    return saved;
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
    console.log('🔄 更新異常範圍:', id, updateAbnormalRangeDto);
    
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

    console.log('✅ 更新成功:', abnormalRange);
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
  async checkMeasurementAbnormal(measurementType: string, values: any): Promise<{ isAbnormal: boolean; reasons: any[]; severity?: string }> {
    const range = await this.findByMeasurementType(measurementType);
    if (!range) {
      return { isAbnormal: false, reasons: [] };
    }

    const reasons: any[] = [];
    let isAbnormal = false;
    let maxSeverity = 'normal';

    const getSeverityLevel = (value: number, paramName: string, abnormalRanges: any) => {
      if (!abnormalRanges || !abnormalRanges[paramName]) {
        return 'normal';
      }

      const ranges = abnormalRanges[paramName];
      
      if (ranges.critical && value >= ranges.critical.min && value <= ranges.critical.max) {
        return 'critical';
      }
      if (ranges.severeHigh && value >= ranges.severeHigh.min && value <= ranges.severeHigh.max) {
        return 'severeHigh';
      }
      if (ranges.high && value >= ranges.high.min && value <= ranges.high.max) {
        return 'high';
      }
      if (ranges.low && value >= ranges.low.min && value <= ranges.low.max) {
        return 'low';
      }
      if (ranges.severeLow && value >= ranges.severeLow.min && value <= ranges.severeLow.max) {
        return 'severeLow';
      }
      
      return 'normal';
    };

    const updateMaxSeverity = (severity: string) => {
      const severityOrder = ['normal', 'low', 'high', 'severeLow', 'severeHigh', 'critical'];
      if (severityOrder.indexOf(severity) > severityOrder.indexOf(maxSeverity)) {
        maxSeverity = severity;
      }
    };

    switch (measurementType) {
      case 'blood_pressure':
        if (values.systolic) {
          // 檢查正常範圍
          if (range.normalRange.systolic) {
            if (values.systolic < range.normalRange.systolic.min || values.systolic > range.normalRange.systolic.max) {
              isAbnormal = true;
              const severity = getSeverityLevel(values.systolic, 'systolic', range.abnormalRanges);
              updateMaxSeverity(severity);
              reasons.push({
                type: 'systolic_pressure',
                value: values.systolic,
                unit: 'mmHg',
                severity: severity,
                normalRange: range.normalRange.systolic,
                isHigh: values.systolic > range.normalRange.systolic.max
              });
            }
          }
        }
        if (values.diastolic) {
          if (range.normalRange.diastolic) {
            if (values.diastolic < range.normalRange.diastolic.min || values.diastolic > range.normalRange.diastolic.max) {
              isAbnormal = true;
              const severity = getSeverityLevel(values.diastolic, 'diastolic', range.abnormalRanges);
              updateMaxSeverity(severity);
              reasons.push({
                type: 'diastolic_pressure',
                value: values.diastolic,
                unit: 'mmHg',
                severity: severity,
                normalRange: range.normalRange.diastolic,
                isHigh: values.diastolic > range.normalRange.diastolic.max
              });
            }
          }
        }
        break;

      case 'heart_rate':
        if (values.rate && range.normalRange.heartRate) {
          if (values.rate < range.normalRange.heartRate.min || values.rate > range.normalRange.heartRate.max) {
            isAbnormal = true;
            const severity = getSeverityLevel(values.rate, 'heartRate', range.abnormalRanges);
            updateMaxSeverity(severity);
            reasons.push({
              type: 'heart_rate',
              value: values.rate,
              unit: 'bpm',
              severity: severity,
              normalRange: range.normalRange.heartRate,
              isHigh: values.rate > range.normalRange.heartRate.max
            });
          }
        }
        break;

      case 'temperature':
        if (values.celsius && range.normalRange.temperature) {
          if (values.celsius < range.normalRange.temperature.min || values.celsius > range.normalRange.temperature.max) {
            isAbnormal = true;
            const severity = getSeverityLevel(values.celsius, 'temperature', range.abnormalRanges);
            updateMaxSeverity(severity);
            reasons.push({
              type: 'temperature',
              value: values.celsius,
              unit: '°C',
              severity: severity,
              normalRange: range.normalRange.temperature,
              isHigh: values.celsius > range.normalRange.temperature.max
            });
          }
        }
        break;

      case 'oxygen_saturation':
        if (values.percentage && range.normalRange.oxygenSaturation) {
          if (values.percentage < range.normalRange.oxygenSaturation.min || values.percentage > range.normalRange.oxygenSaturation.max) {
            isAbnormal = true;
            const severity = getSeverityLevel(values.percentage, 'oxygenSaturation', range.abnormalRanges);
            updateMaxSeverity(severity);
            reasons.push({
              type: 'oxygen_saturation',
              value: values.percentage,
              unit: '%',
              severity: severity,
              normalRange: range.normalRange.oxygenSaturation,
              isHigh: values.percentage > range.normalRange.oxygenSaturation.max
            });
          }
        }
        break;

      case 'blood_glucose':
        if (values.mg_dl && range.normalRange.bloodGlucose) {
          if (values.mg_dl < range.normalRange.bloodGlucose.min) {
            isAbnormal = true;
            const severity = getSeverityLevel(values.mg_dl, 'bloodGlucose', range.abnormalRanges);
            updateMaxSeverity(severity);
            reasons.push({
              type: 'blood_glucose',
              value: values.mg_dl,
              unit: 'mg/dL',
              severity: severity,
              normalRange: range.normalRange.bloodGlucose,
              isHigh: false
            });
          } else if (values.mg_dl > range.normalRange.bloodGlucose.max) {
            isAbnormal = true;
            const severity = getSeverityLevel(values.mg_dl, 'bloodGlucose', range.abnormalRanges);
            updateMaxSeverity(severity);
            reasons.push({
              type: 'blood_glucose',
              value: values.mg_dl,
              unit: 'mg/dL',
              severity: severity,
              normalRange: range.normalRange.bloodGlucose,
              isHigh: true
            });
          }
        }
        break;
    }

    return { isAbnormal, reasons, severity: maxSeverity };
  }
} 