import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Measurement, MeasurementDocument } from '../schemas/measurement.schema';
import { CreateMeasurementDto, UpdateMeasurementStatusDto } from '../dto/measurement.dto';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectModel(Measurement.name) private measurementModel: Model<MeasurementDocument>,
  ) {}

  async create(userId: string, createMeasurementDto: CreateMeasurementDto) {
    // 检测异常数据
    const isAbnormal = this.detectAbnormalValues(createMeasurementDto);
    
    const measurement = new this.measurementModel({
      userId,
      ...createMeasurementDto,
      isAbnormal,
      measurementTime: createMeasurementDto.measurementTime || new Date(),
    });

    return measurement.save();
  }

  async findAll() {
    return this.measurementModel
      .find()
      .populate('userId', 'username fullName role')
      .sort({ createdAt: -1 });
  }

  async findByUserId(userId: string) {
    return this.measurementModel
      .find({ userId })
      .sort({ createdAt: -1 });
  }

  async findAbnormalMeasurements() {
    return this.measurementModel
      .find({ isAbnormal: true, status: 'pending' })
      .populate('userId', 'username fullName role phone email')
      .sort({ createdAt: -1 });
  }

  async findAbnormalByUserId(userId: string) {
    return this.measurementModel
      .find({ userId, isAbnormal: true })
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

  private detectAbnormalValues(measurement: CreateMeasurementDto): boolean {
    // 异常值检测逻辑
    const abnormalConditions = [
      measurement.systolic > 140 || measurement.systolic < 90,  // 收缩压异常
      measurement.diastolic > 90 || measurement.diastolic < 60, // 舒张压异常
      measurement.heartRate > 100 || measurement.heartRate < 60, // 心率异常
      measurement.temperature > 37.5 || measurement.temperature < 36.0, // 体温异常
      measurement.oxygenSaturation < 95, // 血氧饱和度异常
    ];

    return abnormalConditions.some(condition => condition);
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