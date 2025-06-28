import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query, UseInterceptors, UploadedFiles, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { join } from 'path';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto, UpdateMeasurementStatusDto } from '../dto/measurement.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { multerConfig } from '../config/multer.config';

@ApiTags('测量数据')
@Controller('measurements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5, multerConfig))
  @ApiOperation({ summary: '提交测量数据' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '提交成功' })
  async create(
    @Request() req, 
    @Body() createMeasurementDto: any, // 使用any类型以便手动处理数据转换
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      // 处理上传的图片路径
      const imagePaths = files ? files.map(file => {
        // 返回相对于uploads目录的路径
        const relativePath = file.path.replace(process.cwd(), '').replace(/\\/g, '/');
        return relativePath.startsWith('/') ? relativePath : '/' + relativePath;
      }) : [];

      // 手动转换数据类型（multipart/form-data中所有数据都是字符串）
      const measurementData: CreateMeasurementDto = {
        systolic: createMeasurementDto.systolic ? parseFloat(createMeasurementDto.systolic) : undefined,
        diastolic: createMeasurementDto.diastolic ? parseFloat(createMeasurementDto.diastolic) : undefined,
        heartRate: createMeasurementDto.heartRate ? parseFloat(createMeasurementDto.heartRate) : undefined,
        temperature: createMeasurementDto.temperature ? parseFloat(createMeasurementDto.temperature) : undefined,
        oxygenSaturation: createMeasurementDto.oxygenSaturation ? parseFloat(createMeasurementDto.oxygenSaturation) : undefined,
        notes: createMeasurementDto.notes || '',
        measurementTime: createMeasurementDto.measurementTime,
        imagePaths
      };

      // 过滤掉undefined值
      Object.keys(measurementData).forEach(key => {
        if (measurementData[key] === undefined) {
          delete measurementData[key];
        }
      });

      return this.measurementsService.create(req.user._id, measurementData);
    } catch (error) {
      console.error('创建测量记录时出错:', error);
      throw error;
    }
  }

  @Get('images/:userId/:filename')
  @ApiOperation({ summary: '获取患者上传的图片' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getImage(
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const imagePath = join(process.cwd(), 'uploads', 'pic', userId, filename);
    return res.sendFile(imagePath);
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