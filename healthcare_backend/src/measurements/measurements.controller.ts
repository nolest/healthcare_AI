import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto, UpdateMeasurementStatusDto } from '../dto/measurement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('测量数据')
@Controller('measurements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  @ApiOperation({ summary: '提交测量数据' })
  @ApiResponse({ status: 201, description: '提交成功' })
  async create(@Request() req, @Body() createMeasurementDto: CreateMeasurementDto) {
    return this.measurementsService.create(req.user._id, createMeasurementDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取所有测量数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll() {
    return this.measurementsService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的测量数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findMy(@Request() req) {
    return this.measurementsService.findByUserId(req.user._id);
  }

  @Get('abnormal')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取异常测量数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAbnormal() {
    return this.measurementsService.findAbnormalMeasurements();
  }

  @Get('abnormal/my')
  @ApiOperation({ summary: '获取我的异常测量数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findMyAbnormal(@Request() req) {
    return this.measurementsService.findAbnormalByUserId(req.user._id);
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取指定用户的测量数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findByUserId(@Param('userId') userId: string) {
    return this.measurementsService.findByUserId(userId);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '更新测量记录状态（医护人员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateMeasurementStatusDto,
    @Request() req
  ) {
    return this.measurementsService.updateStatus(id, updateStatusDto, req.user._id, req.user.role);
  }

  @Patch('patient/:patientId/process')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '批量处理患者测量记录（医护人员）' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async processPatientMeasurements(@Param('patientId') patientId: string, @Request() req) {
    return this.measurementsService.markPatientMeasurementsAsProcessed(patientId, req.user._id, req.user.role);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取测量数据统计（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    return this.measurementsService.getStats();
  }
} 