import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { CovidAssessmentsService, CreateCovidAssessmentDto, UpdateCovidAssessmentDto } from './covid-assessments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('COVID评估')
@Controller('covid-assessments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CovidAssessmentsController {
  constructor(private readonly covidAssessmentsService: CovidAssessmentsService) {}

  @Post()
  @ApiOperation({ summary: '创建COVID评估' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Request() req, @Body() createCovidAssessmentDto: CreateCovidAssessmentDto) {
    return this.covidAssessmentsService.create(req.user._id, createCovidAssessmentDto);
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