import { Controller, Post, Get, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MeasurementDiagnosesService } from './measurement-diagnoses.service';
import { CreateMeasurementDiagnosisDto } from '../dto/measurement-diagnosis.dto';

@Controller('measurement-diagnoses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeasurementDiagnosesController {
  constructor(private readonly measurementDiagnosesService: MeasurementDiagnosesService) {}

  @Post()
  @Roles('medical_staff')
  async create(@Body() createDto: CreateMeasurementDiagnosisDto, @Request() req) {
    try {
      console.log('🔍 创建诊断请求 - 用户信息:', req.user);
      console.log('🔍 创建诊断请求 - 用户ID:', req.user._id);
      console.log('🔍 创建诊断请求 - 诊断数据:', createDto);
      
      const diagnosis = await this.measurementDiagnosesService.create(createDto, req.user._id.toString());
      return {
        success: true,
        data: diagnosis,
        message: '测量诊断创建成功'
      };
    } catch (error) {
      console.error('创建测量诊断失败:', error);
      return {
        success: false,
        message: error.message || '创建测量诊断失败'
      };
    }
  }

  @Get()
  @Roles('medical_staff')
  async findAll() {
    try {
      const diagnoses = await this.measurementDiagnosesService.findAll();
      return {
        success: true,
        data: diagnoses,
        message: '获取诊断记录成功'
      };
    } catch (error) {
      console.error('获取诊断记录失败:', error);
      return {
        success: false,
        message: error.message || '获取诊断记录失败'
      };
    }
  }

  @Get('my')
  @Roles('medical_staff')
  async findMyDiagnoses(@Request() req) {
    try {
      const diagnoses = await this.measurementDiagnosesService.findByDoctorId(req.user._id.toString());
      return {
        success: true,
        data: diagnoses,
        message: '获取我的诊断记录成功'
      };
    } catch (error) {
      console.error('获取我的诊断记录失败:', error);
      return {
        success: false,
        message: error.message || '获取我的诊断记录失败'
      };
    }
  }

  @Get('patient/:patientId')
  @Roles('medical_staff', 'patient')
  async findByPatientId(@Param('patientId') patientId: string, @Request() req) {
    try {
      // 如果是患者，只能查看自己的诊断记录
      if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
        return {
          success: false,
          message: '没有权限查看其他患者的诊断记录'
        };
      }

      const diagnoses = await this.measurementDiagnosesService.findByPatientId(patientId);
      return {
        success: true,
        data: diagnoses,
        message: '获取患者诊断记录成功'
      };
    } catch (error) {
      console.error('获取患者诊断记录失败:', error);
      return {
        success: false,
        message: error.message || '获取患者诊断记录失败'
      };
    }
  }

  @Get('patient/:patientId/unread-count')
  @Roles('medical_staff', 'patient')
  async getUnreadCount(@Param('patientId') patientId: string, @Request() req) {
    try {
      // 如果是患者，只能查看自己的未读数量
      if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
        return {
          success: false,
          message: '没有权限查看其他患者的诊断记录'
        };
      }

      const count = await this.measurementDiagnosesService.getUnreadCount(patientId);
      return count; // 直接返回数字，保持与前端期望的格式一致
    } catch (error) {
      console.error('获取未读诊断数量失败:', error);
      return 0; // 出错时返回0
    }
  }

  @Get('measurement/:measurementId')
  @Roles('medical_staff', 'patient')
  async findByMeasurementId(@Param('measurementId') measurementId: string) {
    try {
      const diagnosis = await this.measurementDiagnosesService.findByMeasurementId(measurementId);
      return {
        success: true,
        data: diagnosis,
        message: diagnosis ? '获取测量诊断记录成功' : '未找到相关诊断记录'
      };
    } catch (error) {
      console.error('获取测量诊断记录失败:', error);
      return {
        success: false,
        message: error.message || '获取测量诊断记录失败'
      };
    }
  }

  @Get(':id')
  @Roles('medical_staff', 'patient')
  async findById(@Param('id') id: string) {
    try {
      const diagnosis = await this.measurementDiagnosesService.findById(id);
      return {
        success: true,
        data: diagnosis,
        message: '获取诊断记录成功'
      };
    } catch (error) {
      console.error('获取诊断记录失败:', error);
      return {
        success: false,
        message: error.message || '获取诊断记录失败'
      };
    }
  }
}
