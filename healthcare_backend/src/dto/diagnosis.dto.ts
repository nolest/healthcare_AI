import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiagnosisDto {
  @ApiProperty({ description: '测量记录ID' })
  @IsString()
  @IsNotEmpty()
  measurementId: string;

  @ApiProperty({ description: '诊断结果' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiProperty({ description: '治疗建议' })
  @IsString()
  @IsNotEmpty()
  treatment: string;

  @ApiProperty({ description: '复诊日期', required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateDiagnosisDto {
  @ApiProperty({ description: '诊断结果', required: false })
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @ApiProperty({ description: '治疗建议', required: false })
  @IsOptional()
  @IsString()
  treatment?: string;

  @ApiProperty({ description: '复诊日期', required: false })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: '状态', enum: ['active', 'completed', 'cancelled'], required: false })
  @IsOptional()
  @IsEnum(['active', 'completed', 'cancelled'])
  status?: string;
} 