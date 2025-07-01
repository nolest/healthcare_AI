import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
      assessmentType: predictedType // 使用AI预测的类型
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
        recommendations.testing.push('立即进行PCR检测');
        recommendations.testing.push('考虑快速抗原检测作为补充');
        recommendations.isolation.push('立即开始隔离，直到获得阴性检测结果');
        recommendations.isolation.push('隔离期间避免与他人接触');
        recommendations.monitoring.push('密切监测症状变化');
        recommendations.monitoring.push('每日测量体温');
        recommendations.medical.push('立即联系医疗机构');
        recommendations.medical.push('如出现呼吸困难，立即就医');
        break;

      case 'high':
        recommendations.testing.push('建议在24小时内进行检测');
        recommendations.testing.push('可考虑快速抗原检测');
        recommendations.isolation.push('开始预防性隔离');
        recommendations.isolation.push('避免与高风险人群接触');
        recommendations.monitoring.push('监测症状发展');
        recommendations.monitoring.push('记录体温变化');
        recommendations.medical.push('联系医疗提供者咨询');
        break;

      case 'medium':
        recommendations.testing.push('考虑进行检测');
        recommendations.isolation.push('减少外出和社交活动');
        recommendations.monitoring.push('观察症状变化');
        recommendations.prevention.push('佩戴口罩');
        recommendations.prevention.push('勤洗手');
        break;

      case 'low':
      case 'very_low':
        recommendations.monitoring.push('继续观察症状');
        recommendations.prevention.push('保持良好卫生习惯');
        recommendations.prevention.push('充足休息');
        recommendations.prevention.push('多喝水');
        break;
    }

    return recommendations;
  }
} 