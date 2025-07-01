import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DiagnosisReport, DiagnosisReportDocument } from '../schemas/diagnosis-report.schema';
import { Measurement, MeasurementDocument } from '../schemas/measurement.schema';
import { CovidAssessment, CovidAssessmentDocument } from '../schemas/covid-assessment.schema';
import { CreateDiagnosisReportDto, UpdateDiagnosisReportDto } from '../dto/diagnosis-report.dto';

@Injectable()
export class DiagnosisReportsService {
  constructor(
    @InjectModel(DiagnosisReport.name) private diagnosisReportModel: Model<DiagnosisReportDocument>,
    @InjectModel(Measurement.name) private measurementModel: Model<MeasurementDocument>,
    @InjectModel(CovidAssessment.name) private covidAssessmentModel: Model<CovidAssessmentDocument>,
  ) {}

  async create(createDiagnosisReportDto: CreateDiagnosisReportDto, doctorId: string): Promise<DiagnosisReport> {
    const { patientId, reportType, sourceId, ...reportData } = createDiagnosisReportDto;

    // 验证源数据是否存在并获取数据快照
    let sourceData;
    let sourceModel;
    
    if (reportType === 'measurement') {
      sourceData = await this.measurementModel.findById(sourceId);
      sourceModel = 'Measurement';
      if (!sourceData) {
        throw new NotFoundException('测量记录不存在');
      }
    } else if (reportType === 'covid_flu') {
      sourceData = await this.covidAssessmentModel.findById(sourceId);
      sourceModel = 'CovidAssessment';
      if (!sourceData) {
        throw new NotFoundException('COVID/流感评估记录不存在');
      }
    } else {
      throw new NotFoundException('无效的报告类型');
    }

    // 验证源数据是否属于指定患者
    const sourceUserId = sourceData.userId?.toString() || sourceData.patientId?.toString();
    if (sourceUserId !== patientId) {
      throw new NotFoundException('源数据与患者不匹配');
    }

    // 创建源数据快照
    const sourceDataSnapshot = {
      ...sourceData.toObject(),
      _id: undefined,
      __v: undefined,
      createdAt: sourceData.createdAt,
      updatedAt: sourceData.updatedAt
    };

    const diagnosisReport = new this.diagnosisReportModel({
      ...reportData,
      patientId,
      doctorId,
      reportType,
      sourceId,
      sourceModel,
      sourceDataSnapshot,
    });

    return diagnosisReport.save();
  }

  async findAll(): Promise<DiagnosisReport[]> {
    return this.diagnosisReportModel
      .find()
      .populate('patientId', 'username email fullName')
      .populate('doctorId', 'username email fullName')
      .populate('sourceId')
      .sort({ createdAt: -1 });
  }

  async findByPatient(patientId: string): Promise<DiagnosisReport[]> {
    return this.diagnosisReportModel
      .find({ patientId })
      .populate('doctorId', 'username email fullName')
      .populate('sourceId')
      .sort({ createdAt: -1 });
  }

  async findByDoctor(doctorId: string): Promise<DiagnosisReport[]> {
    return this.diagnosisReportModel
      .find({ doctorId })
      .populate('patientId', 'username email fullName')
      .populate('sourceId')
      .sort({ createdAt: -1 });
  }

  async findUnreadByPatient(patientId: string): Promise<DiagnosisReport[]> {
    return this.diagnosisReportModel
      .find({ patientId, isRead: false })
      .populate('doctorId', 'username email fullName')
      .populate('sourceId')
      .sort({ createdAt: -1 });
  }

  async getUnreadCountByPatient(patientId: string): Promise<number> {
    return this.diagnosisReportModel.countDocuments({ patientId, isRead: false });
  }

  async findPendingReports(): Promise<DiagnosisReport[]> {
    return this.diagnosisReportModel
      .find({ status: 'pending' })
      .populate('patientId', 'username email fullName')
      .populate('sourceId')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string): Promise<DiagnosisReport> {
    const report = await this.diagnosisReportModel
      .findById(id)
      .populate('patientId', 'username email fullName')
      .populate('doctorId', 'username email fullName')
      .populate('sourceId');

    if (!report) {
      throw new NotFoundException('诊断报告不存在');
    }

    return report;
  }

  async markAsRead(id: string, userId: string): Promise<DiagnosisReport> {
    const report = await this.diagnosisReportModel.findById(id);
    
    if (!report) {
      throw new NotFoundException('诊断报告不存在');
    }

    // 验证是否是患者本人
    if (report.patientId.toString() !== userId) {
      throw new NotFoundException('无权访问此诊断报告');
    }

    if (!report.isRead) {
      report.isRead = true;
      report.readAt = new Date();
      await report.save();
    }

    return this.findOne(id);
  }

  async update(id: string, updateDiagnosisReportDto: UpdateDiagnosisReportDto): Promise<DiagnosisReport> {
    const report = await this.diagnosisReportModel.findByIdAndUpdate(
      id,
      updateDiagnosisReportDto,
      { new: true, runValidators: true }
    ).populate('patientId', 'username email fullName')
      .populate('doctorId', 'username email fullName')
      .populate('sourceId');

    if (!report) {
      throw new NotFoundException('诊断报告不存在');
    }

    return report;
  }

  async remove(id: string): Promise<void> {
    const result = await this.diagnosisReportModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('诊断报告不存在');
    }
  }

  // 获取需要诊断的数据（测量异常 + 所有COVID评估）
  async getDataNeedingDiagnosis(): Promise<any> {
    // 获取所有已有诊断报告的源ID
    const existingReports = await this.diagnosisReportModel.find().select('sourceId reportType');
    const diagnosedMeasurementIds = existingReports
      .filter(r => r.reportType === 'measurement')
      .map(r => r.sourceId.toString());
    const diagnosedCovidIds = existingReports
      .filter(r => r.reportType === 'covid_flu')
      .map(r => r.sourceId.toString());

    // 获取需要诊断的异常测量记录
    const abnormalMeasurements = await this.measurementModel
      .find({
        _id: { $nin: diagnosedMeasurementIds },
        isAbnormal: true
      })
      .populate('userId', 'username fullName email')
      .sort({ createdAt: -1 });

    // 获取所有需要诊断的COVID评估记录
    const covidAssessments = await this.covidAssessmentModel
      .find({
        _id: { $nin: diagnosedCovidIds }
      })
      .populate('userId', 'username fullName email')
      .sort({ createdAt: -1 });

    return {
      abnormalMeasurements,
      covidAssessments
    };
  }

  // 统计数据
  async getStatistics(): Promise<any> {
    const totalReports = await this.diagnosisReportModel.countDocuments();
    const pendingReports = await this.diagnosisReportModel.countDocuments({ status: 'pending' });
    const completedReports = await this.diagnosisReportModel.countDocuments({ status: 'completed' });
    const unreadReports = await this.diagnosisReportModel.countDocuments({ isRead: false });

    // 按报告类型统计
    const reportsByType = await this.diagnosisReportModel.aggregate([
      {
        $group: {
          _id: '$reportType',
          count: { $sum: 1 }
        }
      }
    ]);

    // 按紧急程度统计
    const reportsByUrgency = await this.diagnosisReportModel.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      totalReports,
      pendingReports,
      completedReports,
      unreadReports,
      reportsByType,
      reportsByUrgency
    };
  }
} 