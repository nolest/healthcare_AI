import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CovidAssessment, CovidAssessmentDocument } from '../schemas/covid-assessment.schema';
import { User, UserDocument } from '../schemas/user.schema';

export interface CreateCovidAssessmentDto {
  assessmentType?: string; // 'covid' or 'flu' - 可选，由服务器智能判断
  symptoms: string[];
  riskFactors?: string[];
  temperature?: number;
  symptomOnset?: string;
  exposureHistory?: string;
  travelHistory?: string;
  contactHistory?: string;
  additionalNotes?: string;
  riskScore?: number;
  riskLevel?: string;
  riskLevelLabel?: string;
  recommendations?: any;
  severity?: string;
  status?: string; // 评估状态：'pending', 'processed', 'reviewed'
  imagePaths?: string[]; // 图片路径数组
}

export interface UpdateCovidAssessmentDto {
  assessmentType?: string;
  symptoms?: string[];
  riskFactors?: string[];
  temperature?: number;
  symptomOnset?: string;
  exposureHistory?: string;
  travelHistory?: string;
  contactHistory?: string;
  additionalNotes?: string;
  riskScore?: number;
  riskLevel?: string;
  riskLevelLabel?: string;
  recommendations?: any;
  severity?: string;
  status?: string; // 评估状态：'pending', 'processed', 'reviewed'
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
    // 智能判断疾病类型
    const predictedType = this.predictDiseaseType(createCovidAssessmentDto.symptoms || []);
    
    // 如果没有提供风险评分和等级，则计算
    let assessmentData = { 
      ...createCovidAssessmentDto, 
      assessmentType: predictedType, // 使用AI预测的类型
      status: 'pending' // 显式设置状态为待处理
    };
    
    if (!assessmentData.riskScore || !assessmentData.riskLevel) {
      const assessment = this.calculateAssessment(assessmentData);
      assessmentData.riskScore = assessment.riskScore;
      assessmentData.riskLevel = assessment.riskLevel;
      assessmentData.severity = assessment.severity;
      if (!assessmentData.recommendations) {
        assessmentData.recommendations = assessment.recommendations;
      }
    }
    
    const covidAssessment = new this.covidAssessmentModel({
      userId,
      ...assessmentData,
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
    try {
      // 将字符串userId转换为ObjectId进行查询
      const objectId = new Types.ObjectId(userId);
      console.log('findByUserId: 查询userId:', userId, '转换为ObjectId:', objectId);
      
      const assessments = await this.covidAssessmentModel
        .find({ userId: objectId })
        .populate('userId', 'username fullName email phone')
        .sort({ createdAt: -1 })
        .exec();
      
      console.log(`findByUserId: 找到 ${assessments.length} 条COVID评估记录`);
      return assessments;
    } catch (error) {
      console.error('findByUserId: 查询失败:', error);
      // 如果ObjectId转换失败，尝试直接查询
      return this.covidAssessmentModel
        .find({ userId })
        .populate('userId', 'username fullName email phone')
        .sort({ createdAt: -1 })
        .exec();
    }
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
    try {
      const totalAssessments = await this.covidAssessmentModel.countDocuments();
      
      // 按状态统计 - 用于管理页面
      // 简化查询，避免复杂的$or操作
      const allDocs = await this.covidAssessmentModel.find({}, 'status').exec();
      const pending = allDocs.filter(doc => !doc.status || doc.status === 'pending').length;
      const processed = allDocs.filter(doc => doc.status === 'processed' || doc.status === 'reviewed').length;
      
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
        total: totalAssessments,
        totalAssessments,
        pending,
        processed,
        processingRate: totalAssessments > 0 ? Math.round((processed / totalAssessments) * 100) : 0,
        highRiskCount,
        riskStats,
        severityStats,
        recentTrend: recentAssessments,
      };
    } catch (error) {
      console.error('获取COVID评估统计数据时出错:', error);
      // 返回默认数据
      return {
        total: 0,
        totalAssessments: 0,
        pending: 0,
        processed: 0,
        processingRate: 0,
        highRiskCount: 0,
        riskStats: [],
        severityStats: [],
        recentTrend: [],
      };
    }
  }

  async updateStatus(id: string, status: string) {
    const assessment = await this.covidAssessmentModel.findById(id);
    if (!assessment) {
      throw new NotFoundException('COVID评估记录不存在');
    }

    const updatedAssessment = await this.covidAssessmentModel
      .findByIdAndUpdate(id, { status }, { new: true })
      .populate('userId', 'username fullName email phone')
      .exec();

    return updatedAssessment;
  }

  async findWithFilters(filters: {
    patientId?: string;
    patientName?: string;
    riskLevel?: string;
    symptoms?: string[];
    dateRange?: string;
    status?: string;
  }) {
    const query: any = {};
    
    // 状态筛选
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }
    
    // 风险等级筛选
    if (filters.riskLevel && filters.riskLevel !== 'all') {
      query.riskLevel = filters.riskLevel;
    }
    
    // 症状筛选
    if (filters.symptoms && filters.symptoms.length > 0) {
      query.symptoms = { $in: filters.symptoms };
    }
    
    // 时间范围筛选
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date();
      let startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      query.createdAt = { $gte: startDate };
    }

    let assessments = await this.covidAssessmentModel
      .find(query)
      .populate('userId', 'username fullName email phone')
      .sort({ createdAt: -1 })
      .exec();

    // 患者ID和姓名筛选需要在populate后进行
    if (filters.patientId || filters.patientName) {
      assessments = assessments.filter(assessment => {
        const userInfo = assessment.userId as any;
        let match = true;
        
        if (filters.patientId) {
          const patientIdMatch = userInfo?.username?.toLowerCase().includes(filters.patientId.toLowerCase()) ||
                                assessment._id.toString().toLowerCase().includes(filters.patientId.toLowerCase());
          match = match && patientIdMatch;
        }
        
        if (filters.patientName) {
          const patientNameMatch = userInfo?.fullName?.toLowerCase().includes(filters.patientName.toLowerCase());
          match = match && patientNameMatch;
        }
        
        return match;
      });
    }

    return assessments;
  }

  // 智能预测疾病类型
  private predictDiseaseType(symptoms: string[]): string {
    // COVID-19特征症状
    const covidIndicators = [
      'loss_taste_smell', // 味觉嗅觉丧失 - COVID-19特有
      'shortness_breath', // 呼吸困难 - COVID-19常见
    ];
    
    // 流感特征症状
    const fluIndicators = [
      'chills', // 寒颤 - 流感特有
      'body_aches', // 肌肉疼痛 - 流感更常见
    ];
    
    // 计算COVID-19和流感的指示度
    let covidScore = 0;
    let fluScore = 0;
    
    symptoms.forEach(symptom => {
      if (covidIndicators.includes(symptom)) {
        covidScore += 3; // COVID特征症状权重更高
      } else if (fluIndicators.includes(symptom)) {
        fluScore += 3; // 流感特征症状权重更高
      } else {
        // 通用症状，根据症状特点分配权重
        switch (symptom) {
          case 'fever':
            covidScore += 1;
            fluScore += 2; // 流感发烧更常见
            break;
          case 'cough':
            covidScore += 2; // COVID咳嗽更持久
            fluScore += 1;
            break;
          case 'fatigue':
            covidScore += 1;
            fluScore += 2; // 流感疲劳更突然
            break;
          case 'headache':
            fluScore += 2; // 流感头痛更常见
            covidScore += 1;
            break;
          case 'sore_throat':
          case 'runny_nose':
          case 'nausea':
          case 'diarrhea':
            covidScore += 1;
            fluScore += 1;
            break;
        }
      }
    });
    
    // 根据得分判断类型
    if (covidScore > fluScore) {
      return 'covid';
    } else if (fluScore > covidScore) {
      return 'flu';
    } else {
      // 如果得分相等，默认为COVID（更谨慎的做法）
      return 'covid';
    }
  }

  private calculateAssessment(data: any) {
    const { 
      symptoms = [], 
      riskFactors = [], 
      temperature, 
      exposureHistory, 
      assessmentType = 'covid' 
    } = data;
    
    let riskScore = 0;
    let severity = 'mild';
    let riskLevel = 'low';

    // 症状评分 - 基于前端的评分逻辑
    const covidSymptoms = {
      'fever': 3, 'cough': 3, 'shortness_breath': 3, 'loss_taste_smell': 3,
      'fatigue': 2, 'body_aches': 2, 'headache': 2, 'sore_throat': 2,
      'runny_nose': 1, 'nausea': 1, 'diarrhea': 1
    };
    
    const fluSymptoms = {
      'fever': 3, 'cough': 3, 'body_aches': 3, 'fatigue': 3,
      'headache': 2, 'sore_throat': 2, 'runny_nose': 2, 'chills': 2,
      'nausea': 1, 'diarrhea': 1
    };

    const symptomScores = assessmentType === 'covid' ? covidSymptoms : fluSymptoms;
    
    symptoms.forEach(symptom => {
      riskScore += symptomScores[symptom] || 0;
    });

    // 风险因子评分
    const riskFactorWeights = {
      'age_65_plus': 3, 'chronic_lung': 3, 'heart_disease': 3,
      'diabetes': 2, 'obesity': 2, 'immunocompromised': 3,
      'pregnancy': 2, 'smoking': 2, 'kidney_disease': 2, 'liver_disease': 2
    };

    riskFactors.forEach(factor => {
      riskScore += riskFactorWeights[factor] || 0;
    });

    // 体温评分
    if (temperature) {
      if (temperature >= 39) riskScore += 3;
      else if (temperature >= 38) riskScore += 2;
      else if (temperature >= 37.5) riskScore += 1;
    }

    // 接触史评分
    if (exposureHistory === 'confirmed') riskScore += 4;
    else if (exposureHistory === 'suspected') riskScore += 2;
    else if (exposureHistory === 'community') riskScore += 1;

    // 确定风险等级
    if (riskScore >= 12) {
      riskLevel = 'very_high';
      severity = 'severe';
    } else if (riskScore >= 8) {
      riskLevel = 'high';
      severity = 'severe';
    } else if (riskScore >= 5) {
      riskLevel = 'medium';
      severity = 'moderate';
    } else if (riskScore >= 2) {
      riskLevel = 'low';
      severity = 'mild';
    } else {
      riskLevel = 'very_low';
      severity = 'mild';
    }

    // 生成建议
    const recommendations = this.generateRecommendations(riskLevel, assessmentType);

    return {
      riskScore,
      severity,
      riskLevel,
      recommendations
    };
  }

  private generateRecommendations(riskLevel: string, assessmentType: string) {
    const recommendations = {
      testing: [],
      isolation: [],
      monitoring: [],
      medical: [],
      prevention: []
    };

    switch (riskLevel) {
      case 'very_high':
        recommendations.testing.push({
          key: 'immediate_pcr',
          category: 'testing',
          priority: 'high',
          type: 'action'
        });
        recommendations.testing.push({
          key: 'rapid_antigen_supplement',
          category: 'testing',
          priority: 'medium',
          type: 'action'
        });
        recommendations.isolation.push({
          key: 'immediate_until_negative',
          category: 'isolation',
          priority: 'high',
          type: 'action'
        });
        recommendations.isolation.push({
          key: 'avoid_contact',
          category: 'isolation',
          priority: 'high',
          type: 'action'
        });
        recommendations.monitoring.push({
          key: 'close_symptom_monitoring',
          category: 'monitoring',
          priority: 'high',
          type: 'action'
        });
        recommendations.monitoring.push({
          key: 'daily_temperature',
          category: 'monitoring',
          priority: 'high',
          type: 'action'
        });
        recommendations.medical.push({
          key: 'immediate_contact',
          category: 'medical',
          priority: 'high',
          type: 'action'
        });
        recommendations.medical.push({
          key: 'breathing_difficulty_emergency',
          category: 'medical',
          priority: 'critical',
          type: 'warning'
        });
        break;

      case 'high':
        recommendations.testing.push({
          key: 'within_24_hours',
          category: 'testing',
          priority: 'high',
          type: 'action'
        });
        recommendations.testing.push({
          key: 'consider_rapid_antigen',
          category: 'testing',
          priority: 'medium',
          type: 'action'
        });
        recommendations.isolation.push({
          key: 'preventive_isolation',
          category: 'isolation',
          priority: 'high',
          type: 'action'
        });
        recommendations.isolation.push({
          key: 'avoid_high_risk_contact',
          category: 'isolation',
          priority: 'medium',
          type: 'action'
        });
        recommendations.monitoring.push({
          key: 'symptom_development',
          category: 'monitoring',
          priority: 'high',
          type: 'action'
        });
        recommendations.monitoring.push({
          key: 'record_temperature',
          category: 'monitoring',
          priority: 'medium',
          type: 'action'
        });
        recommendations.medical.push({
          key: 'contact_provider',
          category: 'medical',
          priority: 'medium',
          type: 'action'
        });
        break;

      case 'medium':
        recommendations.testing.push({
          key: 'consider_testing',
          category: 'testing',
          priority: 'medium',
          type: 'action'
        });
        recommendations.isolation.push({
          key: 'reduce_social_activity',
          category: 'isolation',
          priority: 'medium',
          type: 'action'
        });
        recommendations.monitoring.push({
          key: 'observe_symptoms',
          category: 'monitoring',
          priority: 'medium',
          type: 'action'
        });
        recommendations.prevention.push({
          key: 'wear_mask',
          category: 'prevention',
          priority: 'medium',
          type: 'action'
        });
        recommendations.prevention.push({
          key: 'frequent_handwashing',
          category: 'prevention',
          priority: 'medium',
          type: 'action'
        });
        break;

      case 'low':
      case 'very_low':
        recommendations.monitoring.push({
          key: 'continue_observation',
          category: 'monitoring',
          priority: 'low',
          type: 'action'
        });
        recommendations.prevention.push({
          key: 'good_hygiene',
          category: 'prevention',
          priority: 'low',
          type: 'action'
        });
        recommendations.prevention.push({
          key: 'adequate_rest',
          category: 'prevention',
          priority: 'low',
          type: 'action'
        });
        recommendations.prevention.push({
          key: 'drink_water',
          category: 'prevention',
          priority: 'low',
          type: 'action'
        });
        break;
    }

    return recommendations;
  }
} 