import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DiagnosesService } from './diagnoses.service';
import { CreateDiagnosisDto, UpdateDiagnosisDto } from '../dto/diagnosis.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('诊断管理')
@Controller('diagnoses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DiagnosesController {
  constructor(private readonly diagnosesService: DiagnosesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '创建诊断记录（医护人员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 404, description: '测量记录不存在' })
  async create(@Request() req, @Body() createDiagnosisDto: CreateDiagnosisDto) {
    return this.diagnosesService.create(req.user._id, createDiagnosisDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取所有诊断记录（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll() {
    return this.diagnosesService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的诊断记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findMy(@Request() req) {
    if (req.user.role === 'patient') {
      return this.diagnosesService.findByPatientId(req.user._id);
    } else {
      return this.diagnosesService.findByDoctorId(req.user._id);
    }
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取诊断统计数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    return this.diagnosesService.getStats();
  }

  @Get('patient/:patientId')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取指定患者的诊断记录（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findByPatientId(@Param('patientId') patientId: string) {
    return this.diagnosesService.findByPatientId(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取诊断记录详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '诊断记录不存在' })
  async findOne(@Param('id') id: string) {
    return this.diagnosesService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '更新诊断记录（医护人员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '诊断记录不存在' })
  @ApiResponse({ status: 403, description: '只能更新自己的诊断记录' })
  async update(
    @Param('id') id: string,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto,
    @Request() req
  ) {
    return this.diagnosesService.update(id, updateDiagnosisDto, req.user._id);
  }
} 