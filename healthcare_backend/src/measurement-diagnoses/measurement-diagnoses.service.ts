import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeasurementDiagnosis, MeasurementDiagnosisDocument } from '../schemas/measurement-diagnosis.schema';
import { Measurement, MeasurementDocument } from '../schemas/measurement.schema';
import { CreateMeasurementDiagnosisDto } from '../dto/measurement-diagnosis.dto';

@Injectable()
export class MeasurementDiagnosesService {
  constructor(
    @InjectModel(MeasurementDiagnosis.name) private measurementDiagnosisModel: Model<MeasurementDiagnosisDocument>,
    @InjectModel(Measurement.name) private measurementModel: Model<MeasurementDocument>,
  ) {}

  async create(createDto: CreateMeasurementDiagnosisDto, doctorId: string): Promise<MeasurementDiagnosisDocument> {
    console.log('🔍 MeasurementDiagnosesService.create - 开始创建诊断');
    console.log('📋 创建数据:', createDto);
    console.log('👨‍⚕️ 医生ID:', doctorId);
    
    // 验证测量记录是否存在
    const measurement = await this.measurementModel.findById(createDto.measurementId);
    if (!measurement) {
      console.error('❌ 测量记录不存在:', createDto.measurementId);
      throw new NotFoundException('测量记录不存在');
    }
    
    console.log('✅ 找到测量记录:', measurement._id);

    // 创建诊断记录
    const measurementDiagnosis = new this.measurementDiagnosisModel({
      ...createDto,
      doctorId,
      status: 'completed'
    });
    
    console.log('📝 准备保存的诊断对象:', measurementDiagnosis.toObject());

    try {
      const savedDiagnosis = await measurementDiagnosis.save();
      console.log('✅ 诊断记录保存成功:', savedDiagnosis._id);
      console.log('📄 保存的诊断详情:', savedDiagnosis.toObject());

      // 更新测量记录状态为已处理
      await this.measurementModel.findByIdAndUpdate(
        createDto.measurementId,
        { status: 'processed' }
      );
      console.log('✅ 测量记录状态更新成功');

      return savedDiagnosis;
    } catch (error) {
      console.error('❌ 保存诊断记录失败:', error);
      throw error;
    }
  }

  async findAll(): Promise<MeasurementDiagnosisDocument[]> {
    console.log('🔍 MeasurementDiagnosesService.findAll - 查询所有诊断记录');
    const diagnoses = await this.measurementDiagnosisModel.find()
      .populate('patientId', 'username fullName')
      .populate('doctorId', 'username fullName')
      .populate('measurementId')
      .sort({ createdAt: -1 });
    
    console.log(`📊 找到 ${diagnoses.length} 条诊断记录`);
    return diagnoses;
  }

  async findById(id: string): Promise<MeasurementDiagnosisDocument> {
    const diagnosis = await this.measurementDiagnosisModel.findById(id)
      .populate('patientId', 'username fullName')
      .populate('doctorId', 'username fullName')
      .populate('measurementId');
    
    if (!diagnosis) {
      throw new NotFoundException('诊断记录不存在');
    }
    
    return diagnosis;
  }

  async findByPatientId(patientId: string): Promise<MeasurementDiagnosisDocument[]> {
    return this.measurementDiagnosisModel.find({ patientId })
      .populate('doctorId', 'username fullName')
      .populate('measurementId')
      .sort({ createdAt: -1 });
  }

  async findByDoctorId(doctorId: string): Promise<MeasurementDiagnosisDocument[]> {
    return this.measurementDiagnosisModel.find({ doctorId })
      .populate('patientId', 'username fullName')
      .populate('measurementId')
      .sort({ createdAt: -1 });
  }

  async findByMeasurementId(measurementId: string): Promise<MeasurementDiagnosisDocument> {
    console.log('🔍 MeasurementDiagnosesService.findByMeasurementId - 查询测量记录诊断:', measurementId);
    const diagnosis = await this.measurementDiagnosisModel.findOne({ measurementId })
      .populate('patientId', 'username fullName')
      .populate('doctorId', 'username fullName')
      .populate('measurementId');
    
    console.log('📋 查询结果:', diagnosis ? '找到' : '未找到');
    return diagnosis;
  }

  async getUnreadCount(patientId: string): Promise<number> {
    console.log('🔍 MeasurementDiagnosesService.getUnreadCount - 查询未读诊断数量:', patientId);
    const count = await this.measurementDiagnosisModel.countDocuments({ 
      patientId, 
      isRead: false 
    });
    
    console.log(`📊 患者 ${patientId} 的未读诊断数量:`, count);
    return count;
  }
}
