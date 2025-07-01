import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class CreateDiagnosisReportDto {
  @IsString()
  patientId: string;

  @IsString()
  @IsEnum(['measurement', 'covid_flu'])
  reportType: string;

  @IsString()
  sourceId: string;

  @IsString()
  diagnosis: string;

  @IsString()
  recommendation: string;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  urgency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  // COVID/流感特有字段
  @IsOptional()
  @IsNumber()
  isolationDays?: number;

  @IsOptional()
  @IsString()
  testingRecommendation?: string;

  @IsOptional()
  @IsDateString()
  returnToWorkDate?: string;

  @IsOptional()
  @IsBoolean()
  requiresHospitalization?: boolean;

  @IsOptional()
  @IsString()
  medicationPrescription?: string;

  @IsOptional()
  @IsString()
  monitoringInstructions?: string;
}

export class UpdateDiagnosisReportDto {
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  recommendation?: string;

  @IsOptional()
  @IsString()
  treatment?: string;

  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  urgency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['pending', 'completed', 'under_review'])
  status?: string;

  @IsOptional()
  @IsNumber()
  isolationDays?: number;

  @IsOptional()
  @IsString()
  testingRecommendation?: string;

  @IsOptional()
  @IsDateString()
  returnToWorkDate?: string;

  @IsOptional()
  @IsBoolean()
  requiresHospitalization?: boolean;

  @IsOptional()
  @IsString()
  medicationPrescription?: string;

  @IsOptional()
  @IsString()
  monitoringInstructions?: string;
} 