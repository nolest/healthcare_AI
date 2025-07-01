import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DiagnosisReportsService } from './diagnosis-reports.service';
import { CreateDiagnosisReportDto, UpdateDiagnosisReportDto } from '../dto/diagnosis-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('diagnosis-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiagnosisReportsController {
  constructor(private readonly diagnosisReportsService: DiagnosisReportsService) {}

  @Post()
  @Roles('medical_staff', 'admin')
  create(@Body() createDiagnosisReportDto: CreateDiagnosisReportDto, @Request() req) {
    return this.diagnosisReportsService.create(createDiagnosisReportDto, req.user.userId);
  }

  @Get()
  @Roles('medical_staff', 'admin')
  findAll() {
    return this.diagnosisReportsService.findAll();
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string, @Request() req) {
    // 患者只能查看自己的报告，医护人员可以查看指定患者的报告
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      throw new Error('无权访问此患者的报告');
    }
    return this.diagnosisReportsService.findByPatient(patientId);
  }

  @Get('patient/:patientId/unread')
  findUnreadByPatient(@Param('patientId') patientId: string, @Request() req) {
    // 患者只能查看自己的未读报告
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      throw new Error('无权访问此患者的报告');
    }
    return this.diagnosisReportsService.findUnreadByPatient(patientId);
  }

  @Get('patient/:patientId/unread-count')
  getUnreadCountByPatient(@Param('patientId') patientId: string, @Request() req) {
    // 患者只能查看自己的未读数量
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      throw new Error('无权访问此患者的报告');
    }
    return this.diagnosisReportsService.getUnreadCountByPatient(patientId);
  }

  @Get('doctor/:doctorId')
  @Roles('medical_staff', 'admin')
  findByDoctor(@Param('doctorId') doctorId: string) {
    return this.diagnosisReportsService.findByDoctor(doctorId);
  }

  @Get('pending')
  @Roles('medical_staff', 'admin')
  findPendingReports() {
    return this.diagnosisReportsService.findPendingReports();
  }

  @Get('data-needing-diagnosis')
  @Roles('medical_staff', 'admin')
  getDataNeedingDiagnosis() {
    return this.diagnosisReportsService.getDataNeedingDiagnosis();
  }

  @Get('statistics')
  @Roles('medical_staff', 'admin')
  getStatistics() {
    return this.diagnosisReportsService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.diagnosisReportsService.findOne(id).then(report => {
      // 患者只能查看自己的报告
      if (req.user.role === 'patient' && req.user.userId !== report.patientId.toString()) {
        throw new Error('无权访问此报告');
      }
      return report;
    });
  }

  @Patch(':id/mark-read')
  markAsRead(@Param('id') id: string, @Request() req) {
    return this.diagnosisReportsService.markAsRead(id, req.user.userId);
  }

  @Patch(':id')
  @Roles('medical_staff', 'admin')
  update(@Param('id') id: string, @Body() updateDiagnosisReportDto: UpdateDiagnosisReportDto) {
    return this.diagnosisReportsService.update(id, updateDiagnosisReportDto);
  }

  @Delete(':id')
  @Roles('medical_staff', 'admin')
  remove(@Param('id') id: string) {
    return this.diagnosisReportsService.remove(id);
  }
} 