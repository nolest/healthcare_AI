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
import { createMulterConfig } from '../config/multer.config';

@ApiTags('测量数据')
@Controller('measurements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5, createMulterConfig('measurement')))
  @ApiOperation({ summary: '提交测量数据' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '提交成功' })
  async create(
    @Request() req, 
    @Body() createMeasurementDto: any, // 使用any类型以便手动处理数据转换
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    try {
      console.log(`[${new Date().toISOString()}] 📥 收到测量数据提交请求`);
      console.log(`[${new Date().toISOString()}] 👤 用户信息:`, {
        id: req.user._id,
        username: req.user.username
      });
      console.log(`[${new Date().toISOString()}] 📋 请求体:`, createMeasurementDto);
      console.log(`[${new Date().toISOString()}] 📸 上传文件数量:`, files?.length || 0);
      
      if (files && files.length > 0) {
        console.log(`[${new Date().toISOString()}] 📸 文件详情:`, files.map(f => ({
          originalname: f.originalname,
          filename: f.filename,
          path: f.path,
          size: f.size,
          mimetype: f.mimetype
        })));
      }

      // 处理上传的图片路径
      const imagePaths = files ? files.map(file => {
        // 返回相对于uploads目录的路径
        const relativePath = file.path.replace(process.cwd(), '').replace(/\\/g, '/');
        const finalPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;
        console.log(`[${new Date().toISOString()}] 🖼️ 图片路径处理: ${file.path} -> ${finalPath}`);
        return finalPath;
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

      console.log(`[${new Date().toISOString()}] ✅ 处理后的测量数据:`, measurementData);

      const result = await this.measurementsService.create(req.user._id, measurementData);
      
      console.log(`[${new Date().toISOString()}] ✅ 测量数据创建成功:`, result._id);
      
      return {
        success: true,
        data: result,
        message: '测量数据提交成功'
      };
    } catch (error) {
      console.error(`[${new Date().toISOString()}] ❌ 创建测量记录时出错:`, error);
      console.error(`[${new Date().toISOString()}] ❌ 错误堆栈:`, error.stack);
      
      // 提供更详细的错误信息
      if (error.message && error.message.includes('Upload directory')) {
        throw new Error(`文件上传目录错误: ${error.message}`);
      } else if (error.message && error.message.includes('只允许上传图片文件')) {
        throw new Error(`文件类型错误: ${error.message}`);
      } else if (error.code === 'EACCES') {
        throw new Error('文件系统权限错误，无法创建上传目录或文件');
      } else if (error.code === 'ENOSPC') {
        throw new Error('磁盘空间不足，无法保存上传的文件');
      }
      
      throw error;
    }
  }

  @Get('images/:businessType/:userId/:filename')
  @ApiOperation({ summary: '获取患者上传的图片' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getImage(
    @Param('businessType') businessType: string,
    @Param('userId') userId: string,
    @Param('filename') filename: string,
    @Res() res: Response
  ) {
    const imagePath = join(process.cwd(), 'uploads', 'pic', businessType, userId, filename);
    return res.sendFile(imagePath);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取所有测量数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll() {
    const measurements = await this.measurementsService.findAll();
    return {
      success: true,
      data: measurements,
      count: measurements.length
    };
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的测量数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findMy(@Request() req) {
    const measurements = await this.measurementsService.findByUserId(req.user._id);
    return {
      success: true,
      data: measurements,
      count: measurements.length
    };
  }

  @Get('abnormal')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取异常测量数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAbnormal() {
    const abnormalMeasurements = await this.measurementsService.findAbnormalMeasurements();
    return {
      success: true,
      data: abnormalMeasurements,
      count: abnormalMeasurements.length
    };
  }

  @Get('abnormal/my')
  @ApiOperation({ summary: '获取我的异常测量数据' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findMyAbnormal(@Request() req) {
    const abnormalMeasurements = await this.measurementsService.findAbnormalByUserId(req.user._id);
    return {
      success: true,
      data: abnormalMeasurements,
      count: abnormalMeasurements.length
    };
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取指定用户的测量数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findByUserId(@Param('userId') userId: string) {
    const measurements = await this.measurementsService.findByUserId(userId);
    return {
      success: true,
      data: measurements,
      count: measurements.length
    };
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
    const result = await this.measurementsService.updateStatus(id, updateStatusDto, req.user._id, req.user.role);
    return {
      success: true,
      data: result,
      message: '测量记录状态更新成功'
    };
  }

  @Patch('patient/:patientId/process')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '批量处理患者测量记录（医护人员）' })
  @ApiResponse({ status: 200, description: '处理成功' })
  async processPatientMeasurements(@Param('patientId') patientId: string, @Request() req) {
    const result = await this.measurementsService.markPatientMeasurementsAsProcessed(patientId, req.user._id, req.user.role);
    return {
      success: true,
      data: result,
      message: '患者测量记录批量处理成功'
    };
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取测量数据统计（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    const stats = await this.measurementsService.getStats();
    return {
      success: true,
      data: stats
    };
  }
} 