import { IsNumber, IsString, IsOptional, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeasurementDto {
  @ApiProperty({ description: '收缩压', required: false })
  @IsOptional()
  @IsNumber()
  systolic?: number;

  @ApiProperty({ description: '舒张压', required: false })
  @IsOptional()
  @IsNumber()
  diastolic?: number;

  @ApiProperty({ description: '心率', required: false })
  @IsOptional()
  @IsNumber()
  heartRate?: number;

  @ApiProperty({ description: '体温', required: false })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiProperty({ description: '血氧饱和度', required: false })
  @IsOptional()
  @IsNumber()
  oxygenSaturation?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: '测量时间', required: false })
  @IsOptional()
  @IsDateString()
  measurementTime?: string;
}

export class UpdateMeasurementStatusDto {
  @ApiProperty({ description: '状态', enum: ['pending', 'processed', 'reviewed'] })
  @IsEnum(['pending', 'processed', 'reviewed'])
  status: string;

  @ApiProperty({ description: '是否异常', required: false })
  @IsOptional()
  @IsBoolean()
  isAbnormal?: boolean;
} 