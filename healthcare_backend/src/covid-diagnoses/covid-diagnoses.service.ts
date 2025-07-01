import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CovidDiagnosis, CovidDiagnosisDocument } from '../schemas/covid-diagnosis.schema';
import { CovidAssessment, CovidAssessmentDocument } from '../schemas/covid-assessment.schema';
import { CreateCovidDiagnosisDto, UpdateCovidDiagnosisDto } from '../dto/covid-diagnosis.dto';

@Injectable()
export class CovidDiagnosesService {
  constructor(
    @InjectModel(CovidDiagnosis.name) private covidDiagnosisModel: Model<CovidDiagnosisDocument>,
    @InjectModel(CovidAssessment.name) private covidAssessmentModel: Model<CovidAssessmentDocument>,
  ) {}

  async create(createCovidDiagnosisDto: CreateCovidDiagnosisDto, doctorId: string): Promise<CovidDiagnosis> {
    const { patientId, assessmentId, ...diagnosisData } = createCovidDiagnosisDto;

    // 验证评估是否存在
    const assessment = await this.covidAssessmentModel.findById(assessmentId);
    if (!assessment) {
      throw new NotFoundException('COVID评估记录不存在');
    }

    // 验证评估是否属于指定患者
    if (assessment.userId.toString() !== patientId) {
      throw new NotFoundException('评估记录与患者不匹配');
    }

    const covidDiagnosis = new this.covidDiagnosisModel({
      ...diagnosisData,
      patientId,
      assessmentId,
      doctorId,
    });

    return covidDiagnosis.save();
  }

  async findAll(): Promise<CovidDiagnosis[]> {
    return this.covidDiagnosisModel
      .find()
      .populate('patientId', 'username email fullName')
      .populate('doctorId', 'username email fullName')
      .populate('assessmentId')
      .sort({ createdAt: -1 });
  }

  async findByPatient(patientId: string): Promise<CovidDiagnosis[]> {
    return this.covidDiagnosisModel
      .find({ patientId })
      .populate('doctorId', 'username email fullName')
      .populate('assessmentId')
      .sort({ createdAt: -1 });
  }

  async findByDoctor(doctorId: string): Promise<CovidDiagnosis[]> {
    return this.covidDiagnosisModel
      .find({ doctorId })
      .populate('patientId', 'username email fullName')
      .populate('assessmentId')
      .sort({ createdAt: -1 });
  }

  async findPendingDiagnoses(): Promise<CovidDiagnosis[]> {
    return this.covidDiagnosisModel
      .find({ status: 'pending' })
      .populate('patientId', 'username email fullName')
      .populate('assessmentId')
      .sort({ createdAt: -1 });
  }

  async findByAssessment(assessmentId: string): Promise<CovidDiagnosis> {
    return this.covidDiagnosisModel
      .findOne({ assessmentId })
      .populate('doctorId', 'username email fullName')
      .populate('assessmentId');
  }

  async findOne(id: string): Promise<CovidDiagnosis> {
    const diagnosis = await this.covidDiagnosisModel
      .findById(id)
      .populate('patientId', 'username email fullName')
      .populate('doctorId', 'username email fullName')
      .populate('assessmentId');

    if (!diagnosis) {
      throw new NotFoundException('COVID诊断记录不存在');
    }

    return diagnosis;
  }

  async update(id: string, updateCovidDiagnosisDto: UpdateCovidDiagnosisDto): Promise<CovidDiagnosis> {
    const diagnosis = await this.covidDiagnosisModel.findByIdAndUpdate(
      id,
      updateCovidDiagnosisDto,
      { new: true, runValidators: true }
    ).populate('patientId', 'username email fullName')
      .populate('doctorId', 'username email fullName')
      .populate('assessmentId');

    if (!diagnosis) {
      throw new NotFoundException('COVID诊断记录不存在');
    }

    return diagnosis;
  }

  async remove(id: string): Promise<void> {
    const result = await this.covidDiagnosisModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('COVID诊断记录不存在');
    }
  }

  // 获取需要COVID诊断的评估记录（无论风险等级）
  async getAssessmentsNeedingDiagnosis(): Promise<CovidAssessment[]> {
    // 找出所有没有对应诊断的评估记录
    const existingDiagnoses = await this.covidDiagnosisModel.find().select('assessmentId');
    const diagnosedAssessmentIds = existingDiagnoses.map(d => d.assessmentId.toString());

    return this.covidAssessmentModel
      .find({
        _id: { $nin: diagnosedAssessmentIds }
      })
      .populate('userId', 'username email fullName')
      .sort({ createdAt: -1 });
  }

  // 统计数据
  async getStatistics(): Promise<any> {
    const totalDiagnoses = await this.covidDiagnosisModel.countDocuments();
    const pendingDiagnoses = await this.covidDiagnosisModel.countDocuments({ status: 'pending' });
    const completedDiagnoses = await this.covidDiagnosisModel.countDocuments({ status: 'completed' });
    const urgentCases = await this.covidDiagnosisModel.countDocuments({ urgency: 'urgent' });
    const hospitalizationRequired = await this.covidDiagnosisModel.countDocuments({ requiresHospitalization: true });

    // 按诊断类型统计
    const diagnosisByType = await this.covidDiagnosisModel.aggregate([
      {
        $group: {
          _id: '$diagnosisType',
          count: { $sum: 1 }
        }
      }
    ]);

    // 按风险等级统计
    const diagnosisByRisk = await this.covidDiagnosisModel.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      totalDiagnoses,
      pendingDiagnoses,
      completedDiagnoses,
      urgentCases,
      hospitalizationRequired,
      diagnosisByType,
      diagnosisByRisk
    };
  }
} 