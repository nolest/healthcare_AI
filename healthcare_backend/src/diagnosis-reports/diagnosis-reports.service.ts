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
    console.log('🏥 DiagnosisReportsService.create 开始');
    console.log('📝 输入数据:', JSON.stringify(createDiagnosisReportDto, null, 2));
    console.log('👨‍⚕️ 医生ID:', doctorId);

    try {
      const { patientId, reportType, sourceId, ...reportData } = createDiagnosisReportDto;

      // 简化验证：只验证必要字段存在
      if (!patientId || !reportType || !sourceId) {
        throw new Error('缺少必要字段: patientId, reportType, sourceId');
      }

      // 验证源数据是否存在并获取数据快照
      let sourceData;
      let sourceModel;
      
      console.log('🔍 正在查找源数据...');
      console.log('📊 报告类型:', reportType);
      console.log('🆔 源数据ID:', sourceId);
      
      if (reportType === 'measurement') {
        sourceData = await this.measurementModel.findById(sourceId);
        sourceModel = 'Measurement';
        console.log('📏 查找测量记录结果:', sourceData ? '找到' : '未找到');
        if (sourceData) {
          console.log('📏 测量记录详情:', {
            id: sourceData._id,
            userId: sourceData.userId,
            isAbnormal: sourceData.isAbnormal,
            createdAt: sourceData.createdAt
          });
        }
        if (!sourceData) {
          console.log('❌ 测量记录不存在');
          throw new Error('测量记录不存在');
        }
      } else if (reportType === 'covid_flu') {
        sourceData = await this.covidAssessmentModel.findById(sourceId);
        sourceModel = 'CovidAssessment';
        console.log('🦠 查找COVID评估记录结果:', sourceData ? '找到' : '未找到');
        if (!sourceData) {
          console.log('❌ COVID/流感评估记录不存在');
          throw new Error('COVID/流感评估记录不存在');
        }
      } else {
        console.log('❌ 无效的报告类型:', reportType);
        throw new Error('无效的报告类型');
      }

      // 简化患者数据匹配验证 - 使用更宽松的匹配逻辑
      console.log('🔐 验证患者数据匹配...');
      const sourceUserId = sourceData.userId?.toString() || sourceData.patientId?.toString();
      console.log('👤 源数据用户ID:', sourceUserId);
      console.log('👤 请求患者ID:', patientId);
      
      // 如果用户ID不匹配，记录警告但不阻止创建
      if (sourceUserId && sourceUserId !== patientId) {
        console.log('⚠️ 警告: 源数据与患者ID不完全匹配，但继续创建诊断报告');
        console.log('详细信息:');
        console.log('  - 源数据用户ID:', sourceUserId);
        console.log('  - 请求患者ID:', patientId);
        console.log('  - 类型检查:', typeof sourceUserId, 'vs', typeof patientId);
      } else {
        console.log('✅ 患者ID匹配检查通过');
      }

      // 创建源数据快照
      console.log('📸 创建源数据快照...');
      const sourceDataSnapshot = {
        ...sourceData.toObject(),
        _id: undefined,
        __v: undefined,
        createdAt: sourceData.createdAt,
        updatedAt: sourceData.updatedAt
      };

      console.log('💾 准备保存诊断报告...');
      const diagnosisReport = new this.diagnosisReportModel({
        ...reportData,
        patientId,
        doctorId,
        reportType,
        sourceId,
        sourceModel,
        sourceDataSnapshot,
      });

      console.log('📋 诊断报告数据:', {
        patientId: diagnosisReport.patientId,
        doctorId: diagnosisReport.doctorId,
        reportType: diagnosisReport.reportType,
        sourceId: diagnosisReport.sourceId,
        diagnosis: diagnosisReport.diagnosis,
        recommendation: diagnosisReport.recommendation,
        treatment: diagnosisReport.treatment,
        urgency: diagnosisReport.urgency,
        notes: diagnosisReport.notes
      });

      const savedReport = await diagnosisReport.save();
      console.log('✅ 诊断报告保存成功, ID:', savedReport._id);
      
      return savedReport;
    } catch (error) {
      console.log('❌ DiagnosisReportsService.create 发生错误:');
      console.log('错误类型:', error.constructor.name);
      console.log('错误消息:', error.message);
      if (error.stack) {
        console.log('错误堆栈:', error.stack);
      }
      throw error;
    }
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