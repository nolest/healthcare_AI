import { Controller, Get, Patch, Param, Body, UseGuards, Request, Query, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService, UpdateUserDto } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取所有用户（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('patients')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取所有患者（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findPatients() {
    return this.usersService.findPatients();
  }

  @Get('medical-staff')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取所有医护人员（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async findMedicalStaff() {
    return this.usersService.findMedicalStaff();
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '获取用户统计数据（医护人员）' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getStats() {
    return this.usersService.getStats();
  }

  @Get('search')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '搜索用户（医护人员）' })
  @ApiQuery({ name: 'q', description: '搜索关键词' })
  @ApiQuery({ name: 'role', description: '用户角色', required: false })
  @ApiResponse({ status: 200, description: '搜索成功' })
  async searchUsers(
    @Query('q') query: string,
    @Query('role') role?: string
  ) {
    return this.usersService.searchUsers(query, role);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async findOne(@Param('id') id: string, @Request() req) {
    // 患者只能查看自己的信息，医护人员可以查看所有用户信息
    if (req.user.role === 'patient' && req.user._id !== id) {
      return this.usersService.findById(req.user._id);
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '权限不足' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ) {
    return this.usersService.update(id, updateUserDto, req.user);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('medical_staff')
  @ApiOperation({ summary: '停用用户（医护人员）' })
  @ApiResponse({ status: 200, description: '停用成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  @ApiResponse({ status: 403, description: '不能停用自己的账户' })
  async deactivate(@Param('id') id: string, @Request() req) {
    return this.usersService.deactivate(id, req.user._id, req.user.role);
  }
} 