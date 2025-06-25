import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Diagnosis, DiagnosisDocument } from '../schemas/diagnosis.schema';
import { Measurement, MeasurementDocument } from '../schemas/measurement.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateDiagnosisDto, UpdateDiagnosisDto } from '../dto/diagnosis.dto';

@Injectable()
export class DiagnosesService {
  constructor(
    @InjectModel(Diagnosis.name) private diagnosisModel: Model<DiagnosisDocument>,
    @InjectModel(Measurement.name) private measurementModel: Model<MeasurementDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(doctorId: string, createDiagnosisDto: CreateDiagnosisDto) {
    // 验证测量记录是否存在
    const measurement = await this.measurementModel.findById(createDiagnosisDto.measurementId);
    if (!measurement) {
      throw new NotFoundException('测量记录不存在');
    }

    const diagnosis = new this.diagnosisModel({
      ...createDiagnosisDto,
      doctorId,
      patientId: measurement.userId,
    });

    const savedDiagnosis = await diagnosis.save();
    
    // 更新测量记录状态为已处理
    await this.measurementModel.findByIdAndUpdate(
      createDiagnosisDto.measurementId,
      { status: 'reviewed' }
    );

    return this.findById(savedDiagnosis._id.toString());
  }

  async findAll() {
    return this.diagnosisModel
      .find()
      .populate('patientId', 'username fullName email')
      .populate('doctorId', 'username fullName department')
      .populate('measurementId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const diagnosis = await this.diagnosisModel
      .findById(id)
      .populate('patientId', 'username fullName email phone')
      .populate('doctorId', 'username fullName department')
      .populate('measurementId')
      .exec();

    if (!diagnosis) {
      throw new NotFoundException('诊断记录不存在');
    }

    return diagnosis;
  }

  async findByPatientId(patientId: string) {
    return this.diagnosisModel
      .find({ patientId })
      .populate('doctorId', 'username fullName department')
      .populate('measurementId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByDoctorId(doctorId: string) {
    return this.diagnosisModel
      .find({ doctorId })
      .populate('patientId', 'username fullName email')
      .populate('measurementId')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateDiagnosisDto: UpdateDiagnosisDto, doctorId: string) {
    const diagnosis = await this.diagnosisModel.findById(id);
    if (!diagnosis) {
      throw new NotFoundException('诊断记录不存在');
    }

    // 只有原诊断医生可以更新
    if (diagnosis.doctorId.toString() !== doctorId) {
      throw new ForbiddenException('只能更新自己的诊断记录');
    }

    const updatedDiagnosis = await this.diagnosisModel
      .findByIdAndUpdate(id, updateDiagnosisDto, { new: true })
      .populate('patientId', 'username fullName email phone')
      .populate('doctorId', 'username fullName department')
      .populate('measurementId')
      .exec();

    return updatedDiagnosis;
  }

  async getStats() {
    const totalDiagnoses = await this.diagnosisModel.countDocuments();
    const activeDiagnoses = await this.diagnosisModel.countDocuments({ status: 'active' });
    const completedDiagnoses = await this.diagnosisModel.countDocuments({ status: 'completed' });
    
    // 按状态统计
    const statusStats = await this.diagnosisModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // 最近7天的诊断趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentDiagnoses = await this.diagnosisModel.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    return {
      totalDiagnoses,
      activeDiagnoses,
      completedDiagnoses,
      statusStats,
      recentTrend: recentDiagnoses,
    };
  }
} 