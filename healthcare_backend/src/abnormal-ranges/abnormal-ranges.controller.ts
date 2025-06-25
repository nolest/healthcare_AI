import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AbnormalRangesService } from './abnormal-ranges.service';
import { CreateAbnormalRangeDto, UpdateAbnormalRangeDto } from '../dto/abnormal-range.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('异常值范围设置')
@Controller('abnormal-ranges')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AbnormalRangesController {
  constructor(private readonly abnormalRangesService: AbnormalRangesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '创建异常值范围设置（医护人员）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  create(@Body() createAbnormalRangeDto: CreateAbnormalRangeDto, @Request() req) {
    return this.abnormalRangesService.create(createAbnormalRangeDto, req.user._id);
  }

  @Get()
  @ApiOperation({ summary: '获取所有异常值范围设置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findAll() {
    return this.abnormalRangesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定异常值范围设置' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findOne(@Param('id') id: string) {
    return this.abnormalRangesService.findOne(id);
  }

  @Get('type/:measurementType')
  @ApiOperation({ summary: '根据测量类型获取异常值范围' })
  @ApiResponse({ status: 200, description: '获取成功' })
  findByType(@Param('measurementType') measurementType: string) {
    return this.abnormalRangesService.findByMeasurementType(measurementType);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '更新异常值范围设置（医护人员）' })
  @ApiResponse({ status: 200, description: '更新成功' })
  update(@Param('id') id: string, @Body() updateAbnormalRangeDto: UpdateAbnormalRangeDto, @Request() req) {
    return this.abnormalRangesService.update(id, updateAbnormalRangeDto, req.user._id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '删除异常值范围设置（医护人员）' })
  @ApiResponse({ status: 200, description: '删除成功' })
  remove(@Param('id') id: string) {
    return this.abnormalRangesService.remove(id);
  }
} 