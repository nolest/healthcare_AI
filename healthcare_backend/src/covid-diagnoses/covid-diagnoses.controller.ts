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
  Query,
} from '@nestjs/common';
import { CovidDiagnosesService } from './covid-diagnoses.service';
import { CreateCovidDiagnosisDto, UpdateCovidDiagnosisDto } from '../dto/covid-diagnosis.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('covid-diagnoses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CovidDiagnosesController {
  constructor(private readonly covidDiagnosesService: CovidDiagnosesService) {}

  @Post()
  @Roles('medical_staff')
  create(@Body() createCovidDiagnosisDto: CreateCovidDiagnosisDto, @Request() req) {
    return this.covidDiagnosesService.create(createCovidDiagnosisDto, req.user.userId);
  }

  @Get()
  @Roles('medical_staff')
  findAll() {
    return this.covidDiagnosesService.findAll();
  }

  @Get('pending')
  @Roles('medical_staff')
  findPending() {
    return this.covidDiagnosesService.findPendingDiagnoses();
  }

  @Get('statistics')
  @Roles('medical_staff')
  getStatistics() {
    return this.covidDiagnosesService.getStatistics();
  }

  @Get('assessments-needing-diagnosis')
  @Roles('medical_staff')
  getAssessmentsNeedingDiagnosis() {
    return this.covidDiagnosesService.getAssessmentsNeedingDiagnosis();
  }

  @Get('my-diagnoses')
  @Roles('medical_staff')
  findMyDiagnoses(@Request() req) {
    return this.covidDiagnosesService.findByDoctor(req.user.userId);
  }

  @Get('patient/:patientId')
  @Roles('medical_staff', 'patient')
  findByPatient(@Param('patientId') patientId: string, @Request() req) {
    // 患者只能查看自己的诊断
    if (req.user.role === 'patient' && req.user.userId !== patientId) {
      throw new Error('无权访问此患者的诊断记录');
    }
    return this.covidDiagnosesService.findByPatient(patientId);
  }

  @Get('by-assessment/:assessmentId')
  @Roles('medical_staff', 'patient')
  findByAssessment(@Param('assessmentId') assessmentId: string) {
    return this.covidDiagnosesService.findByAssessment(assessmentId);
  }

  @Get(':id')
  @Roles('medical_staff', 'patient')
  findOne(@Param('id') id: string) {
    return this.covidDiagnosesService.findOne(id);
  }

  @Patch(':id')
  @Roles('medical_staff')
  update(@Param('id') id: string, @Body() updateCovidDiagnosisDto: UpdateCovidDiagnosisDto) {
    return this.covidDiagnosesService.update(id, updateCovidDiagnosisDto);
  }

  @Delete(':id')
  @Roles('medical_staff')
  remove(@Param('id') id: string) {
    return this.covidDiagnosesService.remove(id);
  }
} 