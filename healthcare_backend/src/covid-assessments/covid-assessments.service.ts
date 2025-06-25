import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CovidAssessment, CovidAssessmentDocument } from '../schemas/covid-assessment.schema';
import { User, UserDocument } from '../schemas/user.schema';

export interface CreateCovidAssessmentDto {
  symptoms: string[];
  exposureHistory: boolean;
  travelHistory: boolean;
  contactHistory: boolean;
  vaccinationStatus: string;
  testResults?: string;
  notes?: string;
}

export interface UpdateCovidAssessmentDto {
  symptoms?: string[];
  severity?: string;
  riskLevel?: string;
  recommendations?: string[];
  exposureHistory?: boolean;
  travelHistory?: boolean;
  contactHistory?: boolean;
  vaccinationStatus?: string;
  testResults?: string;
  notes?: string;
}

@Injectable()
export class CovidAssessmentsService {
  constructor(
    @InjectModel(CovidAssessment.name) private covidAssessmentModel: Model<CovidAssessmentDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(userId: string, createCovidAssessmentDto: CreateCovidAssessmentDto) {
    // 基于症状和风险因素计算严重程度和风险等级
    const assessment = this.calculateAssessment(createCovidAssessmentDto);
    
    const covidAssessment = new this.covidAssessmentModel({
      userId,
      ...createCovidAssessmentDto,
      severity: assessment.severity,
      riskLevel: assessment.riskLevel,
      recommendations: assessment.recommendations,
    });

    const savedAssessment = await covidAssessment.save();
    return this.findById(savedAssessment._id.toString());
  }

  async findAll() {
    return this.covidAssessmentModel
      .find()
      .populate('userId', 'username fullName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string) {
    const assessment = await this.covidAssessmentModel
      .findById(id)
      .populate('userId', 'username fullName email phone')
      .exec();

    if (!assessment) {
      throw new NotFoundException('COVID评估记录不存在');
    }

    return assessment;
  }

  async findByUserId(userId: string) {
    return this.covidAssessmentModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findHighRisk() {
    return this.covidAssessmentModel
      .find({ riskLevel: { $in: ['high', 'very_high'] } })
      .populate('userId', 'username fullName email phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateCovidAssessmentDto: UpdateCovidAssessmentDto) {
    const assessment = await this.covidAssessmentModel.findById(id);
    if (!assessment) {
      throw new NotFoundException('COVID评估记录不存在');
    }

    // 如果更新了症状等关键信息，重新计算评估结果
    if (updateCovidAssessmentDto.symptoms || 
        updateCovidAssessmentDto.exposureHistory !== undefined ||
        updateCovidAssessmentDto.contactHistory !== undefined) {
      const recalculated = this.calculateAssessment({
        symptoms: updateCovidAssessmentDto.symptoms || assessment.symptoms,
        exposureHistory: updateCovidAssessmentDto.exposureHistory ?? assessment.exposureHistory,
        travelHistory: updateCovidAssessmentDto.travelHistory ?? assessment.travelHistory,
        contactHistory: updateCovidAssessmentDto.contactHistory ?? assessment.contactHistory,
        vaccinationStatus: updateCovidAssessmentDto.vaccinationStatus || assessment.vaccinationStatus,
      });
      
      updateCovidAssessmentDto.severity = recalculated.severity;
      updateCovidAssessmentDto.riskLevel = recalculated.riskLevel;
      updateCovidAssessmentDto.recommendations = recalculated.recommendations;
    }

    const updatedAssessment = await this.covidAssessmentModel
      .findByIdAndUpdate(id, updateCovidAssessmentDto, { new: true })
      .populate('userId', 'username fullName email phone')
      .exec();

    return updatedAssessment;
  }

  async getStats() {
    const totalAssessments = await this.covidAssessmentModel.countDocuments();
    
    // 按风险等级统计
    const riskStats = await this.covidAssessmentModel.aggregate([
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    // 按严重程度统计
    const severityStats = await this.covidAssessmentModel.aggregate([
      {
        $group: {
          _id: '$severity',
          count: { $sum: 1 }
        }
      }
    ]);

    // 最近7天的评估趋势
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAssessments = await this.covidAssessmentModel.aggregate([
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

    // 高风险患者数量
    const highRiskCount = await this.covidAssessmentModel.countDocuments({
      riskLevel: { $in: ['high', 'very_high'] }
    });

    return {
      totalAssessments,
      highRiskCount,
      riskStats,
      severityStats,
      recentTrend: recentAssessments,
    };
  }

  private calculateAssessment(data: any) {
    const { symptoms, exposureHistory, contactHistory, vaccinationStatus } = data;
    
    let severity = 'mild';
    let riskLevel = 'low';
    const recommendations = [];

    // 基于症状计算严重程度
    const highRiskSymptoms = ['发热', '呼吸困难', '胸痛', '意识模糊'];
    const moderateSymptoms = ['咳嗽', '乏力', '肌肉疼痛', '头痛'];
    
    const hasHighRiskSymptoms = symptoms.some(s => highRiskSymptoms.includes(s));
    const hasModerateSymptoms = symptoms.some(s => moderateSymptoms.includes(s));
    
    if (hasHighRiskSymptoms) {
      severity = 'severe';
      riskLevel = 'high';
      recommendations.push('立即就医');
      recommendations.push('居家隔离');
    } else if (hasModerateSymptoms) {
      severity = 'moderate';
      riskLevel = 'medium';
      recommendations.push('密切观察症状');
      recommendations.push('居家休息');
    }

    // 基于接触史调整风险等级
    if (exposureHistory || contactHistory) {
      if (riskLevel === 'low') riskLevel = 'medium';
      else if (riskLevel === 'medium') riskLevel = 'high';
      recommendations.push('进行COVID-19检测');
      recommendations.push('避免与他人接触');
    }

    // 基于疫苗接种状态调整建议
    if (vaccinationStatus === 'unvaccinated') {
      recommendations.push('建议接种COVID-19疫苗');
    }

    // 通用建议
    recommendations.push('佩戴口罩');
    recommendations.push('勤洗手');
    recommendations.push('保持社交距离');

    return {
      severity,
      riskLevel,
      recommendations: [...new Set(recommendations)] // 去重
    };
  }
} 