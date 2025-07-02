import { IsString, IsOptional, IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMeasurementDiagnosisDto {
  @ApiProperty({ description: '患者ID' })
  @IsMongoId()
  @IsNotEmpty()
  patientId: string;

  @ApiProperty({ description: '测量记录ID' })
  @IsMongoId()
  @IsNotEmpty()
  measurementId: string;

  @ApiProperty({ description: '诊断结果' })
  @IsString()
  @IsNotEmpty()
  diagnosis: string;

  @ApiProperty({ description: '风险等级', enum: ['low', 'medium', 'high', 'critical'], required: false })
  @IsString()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  riskLevel?: string;

  @ApiProperty({ description: '用药建议', required: false })
  @IsString()
  @IsOptional()
  medications?: string;

  @ApiProperty({ description: '生活方式建议', required: false })
  @IsString()
  @IsOptional()
  lifestyle?: string;

  @ApiProperty({ description: '复查建议', required: false })
  @IsString()
  @IsOptional()
  followUp?: string;

  @ApiProperty({ description: '治疗方案', required: false })
  @IsString()
  @IsOptional()
  treatmentPlan?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateMeasurementDiagnosisDto {
  @ApiProperty({ description: '诊断结果', required: false })
  @IsString()
  @IsOptional()
  diagnosis?: string;

  @ApiProperty({ description: '风险等级', enum: ['low', 'medium', 'high', 'critical'], required: false })
  @IsString()
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  riskLevel?: string;

  @ApiProperty({ description: '用药建议', required: false })
  @IsString()
  @IsOptional()
  medications?: string;

  @ApiProperty({ description: '生活方式建议', required: false })
  @IsString()
  @IsOptional()
  lifestyle?: string;

  @ApiProperty({ description: '复查建议', required: false })
  @IsString()
  @IsOptional()
  followUp?: string;

  @ApiProperty({ description: '治疗方案', required: false })
  @IsString()
  @IsOptional()
  treatmentPlan?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: '状态', enum: ['pending', 'completed', 'reviewed'], required: false })
  @IsString()
  @IsOptional()
  @IsEnum(['pending', 'completed', 'reviewed'])
  status?: string;
} 