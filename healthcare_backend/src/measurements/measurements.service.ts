import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Measurement, MeasurementDocument } from '../schemas/measurement.schema';
import { CreateMeasurementDto, UpdateMeasurementStatusDto } from '../dto/measurement.dto';
import { AbnormalRangesService } from '../abnormal-ranges/abnormal-ranges.service';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectModel(Measurement.name) private measurementModel: Model<MeasurementDocument>,
    private abnormalRangesService: AbnormalRangesService,
  ) {}

  async create(userId: string, createMeasurementDto: CreateMeasurementDto) {
    // 使用异常值服务检测异常数据
    const abnormalResult = await this.detectAbnormalValues(createMeasurementDto);
    
    const measurement = new this.measurementModel({
      userId,
      ...createMeasurementDto,
      isAbnormal: abnormalResult.isAbnormal,
      abnormalReasons: abnormalResult.reasons,
      severity: abnormalResult.severity || 'normal',
      measurementTime: createMeasurementDto.measurementTime || new Date(),
    });

    const savedMeasurement = await measurement.save();
    
    // 返回包含异常检测结果的数据
    return {
      ...savedMeasurement.toObject(),
      abnormalResult
    };
  }

  async findAll() {
    return this.measurementModel
      .find()
      .populate('userId', 'username fullName role')
      .sort({ createdAt: -1 });
  }

  async findByUserId(userId: string) {
    return this.measurementModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'username fullName role')
      .sort({ createdAt: -1 });
  }

  async findAbnormalMeasurements() {
    // 返回所有异常测量记录，不限制状态，以便前端正确统计
    return this.measurementModel
      .find({ isAbnormal: true })
      .populate('userId', 'username fullName role phone email')
      .sort({ createdAt: -1 });
  }

  async findPendingAbnormalMeasurements() {
    // 如果需要只获取待处理的异常记录，可以使用这个方法
    return this.measurementModel
      .find({ isAbnormal: true, status: 'pending' })
      .populate('userId', 'username fullName role phone email')
      .sort({ createdAt: -1 });
  }

  async findAbnormalByUserId(userId: string) {
    return this.measurementModel
      .find({ userId: new Types.ObjectId(userId), isAbnormal: true })
      .sort({ createdAt: -1 });
  }

  async updateStatus(id: string, updateStatusDto: UpdateMeasurementStatusDto, currentUserId: string, userRole: string) {
    const measurement = await this.measurementModel.findById(id);
    
    if (!measurement) {
      throw new NotFoundException('测量记录不存在');
    }

    // 只有医护人员可以更新状态
    if (userRole !== 'medical_staff') {
      throw new ForbiddenException('只有医护人员可以更新测量记录状态');
    }

    return this.measurementModel.findByIdAndUpdate(
      id,
      updateStatusDto,
      { new: true }
    ).populate('userId', 'username fullName role');
  }

  async markPatientMeasurementsAsProcessed(patientId: string, currentUserId: string, userRole: string) {
    // 只有医护人员可以批量处理
    if (userRole !== 'medical_staff') {
      throw new ForbiddenException('只有医护人员可以批量处理测量记录');
    }

    return this.measurementModel.updateMany(
      { userId: patientId, status: 'pending' },
      { status: 'processed' }
    );
  }

  private async detectAbnormalValues(measurement: CreateMeasurementDto): Promise<{ isAbnormal: boolean; reasons: any[]; severity?: string }> {
    const allReasons: any[] = [];
    let hasAbnormal = false;
    let maxSeverity = 'normal';

    const updateMaxSeverity = (severity: string) => {
      const severityOrder = ['normal', 'low', 'high', 'severeLow', 'severeHigh', 'critical'];
      if (severityOrder.indexOf(severity) > severityOrder.indexOf(maxSeverity)) {
        maxSeverity = severity;
      }
    };

    // 检查血压
    if (measurement.systolic || measurement.diastolic) {
      const result = await this.abnormalRangesService.checkMeasurementAbnormal('blood_pressure', {
        systolic: measurement.systolic,
        diastolic: measurement.diastolic
      });
      if (result.isAbnormal) {
        hasAbnormal = true;
        allReasons.push(...result.reasons);
        if (result.severity) {
          updateMaxSeverity(result.severity);
        }
      }
    }

    // 检查心率
    if (measurement.heartRate) {
      const result = await this.abnormalRangesService.checkMeasurementAbnormal('heart_rate', {
        rate: measurement.heartRate
      });
      if (result.isAbnormal) {
        hasAbnormal = true;
        allReasons.push(...result.reasons);
        if (result.severity) {
          updateMaxSeverity(result.severity);
        }
      }
    }

    // 检查体温
    if (measurement.temperature) {
      const result = await this.abnormalRangesService.checkMeasurementAbnormal('temperature', {
        celsius: measurement.temperature
      });
      if (result.isAbnormal) {
        hasAbnormal = true;
        allReasons.push(...result.reasons);
        if (result.severity) {
          updateMaxSeverity(result.severity);
        }
      }
    }

    // 检查血氧饱和度
    if (measurement.oxygenSaturation) {
      const result = await this.abnormalRangesService.checkMeasurementAbnormal('oxygen_saturation', {
        percentage: measurement.oxygenSaturation
      });
      if (result.isAbnormal) {
        hasAbnormal = true;
        allReasons.push(...result.reasons);
        if (result.severity) {
          updateMaxSeverity(result.severity);
        }
      }
    }

    return { isAbnormal: hasAbnormal, reasons: allReasons, severity: maxSeverity };
  }

  async getStats() {
    const total = await this.measurementModel.countDocuments();
    const abnormal = await this.measurementModel.countDocuments({ isAbnormal: true });
    const pending = await this.measurementModel.countDocuments({ status: 'pending' });
    
    return {
      total,
      abnormal,
      pending,
      normal: total - abnormal,
    };
  }
} 