import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CovidAssessmentsService, CreateCovidAssessmentDto, UpdateCovidAssessmentDto } from './covid-assessments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { createMulterConfig } from '../config/multer.config';

@ApiTags('COVID评估')
@Controller('covid-assessments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CovidAssessmentsController {
  constructor(private readonly covidAssessmentsService: CovidAssessmentsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('images', 5, createMulterConfig('covid')))
  @ApiOperation({ summary: '创建COVID评估' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(
    @Request() req, 
    @Body() createCovidAssessmentDto: any, // 使用any类型以便手动处理数据转换
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
      const assessmentData: CreateCovidAssessmentDto = {
        symptoms: createCovidAssessmentDto.symptoms ? JSON.parse(createCovidAssessmentDto.symptoms) : [],
        riskFactors: createCovidAssessmentDto.riskFactors ? JSON.parse(createCovidAssessmentDto.riskFactors) : [],
        temperature: createCovidAssessmentDto.temperature ? parseFloat(createCovidAssessmentDto.temperature) : undefined,
        symptomOnset: createCovidAssessmentDto.symptomOnset || '',
        exposureHistory: createCovidAssessmentDto.exposureHistory || '',
        travelHistory: createCovidAssessmentDto.travelHistory || '',
        contactHistory: createCovidAssessmentDto.contactHistory || '',
        additionalNotes: createCovidAssessmentDto.additionalNotes || '',
        riskScore: createCovidAssessmentDto.riskScore ? parseInt(createCovidAssessmentDto.riskScore) : 0,
        riskLevel: createCovidAssessmentDto.riskLevel || '',
        riskLevelLabel: createCovidAssessmentDto.riskLevelLabel || '',
        recommendations: createCovidAssessmentDto.recommendations ? JSON.parse(createCovidAssessmentDto.recommendations) : {},
        imagePaths
      };

      // 过滤掉undefined值
      Object.keys(assessmentData).forEach(key => {
        if (assessmentData[key] === undefined) {
          delete assessmentData[key];
        }
      });

      return this.covidAssessmentsService.create(req.user._id, assessmentData);
    } catch (error) {
      console.error('创建COVID评估记录时出错:', error);
      throw error;
    }
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取所有COVID评估（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll() {
    return this.covidAssessmentsService.findAll();
  }

  @Get('my')
  @ApiOperation({ summary: '获取我的COVID评估记录' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findMy(@Request() req) {
    return this.covidAssessmentsService.findByUserId(req.user._id);
  }

  @Get('high-risk')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取高风险COVID评估（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findHighRisk() {
    return this.covidAssessmentsService.findHighRisk();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取COVID评估统计数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    return this.covidAssessmentsService.getStats();
  }

  @Get('user/:userId')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取指定用户的COVID评估（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findByUserId(@Param('userId') userId: string) {
    return this.covidAssessmentsService.findByUserId(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取COVID评估详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: 'COVID评估记录不存在' })
  async findOne(@Param('id') id: string) {
    return this.covidAssessmentsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '更新COVID评估（医护人员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: 'COVID评估记录不存在' })
  async update(
    @Param('id') id: string,
    @Body() updateCovidAssessmentDto: UpdateCovidAssessmentDto
  ) {
    return this.covidAssessmentsService.update(id, updateCovidAssessmentDto);
  }
} 