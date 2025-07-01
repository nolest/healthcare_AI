import { IsString, IsOptional, IsBoolean, IsNumber, IsDateString, IsEnum } from 'class-validator';

export class CreateCovidDiagnosisDto {
  @IsString()
  patientId: string;

  @IsString()
  assessmentId: string;

  @IsString()
  @IsEnum(['covid', 'flu', 'other'])
  diagnosisType: string;

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
  @IsNumber()
  isolationDays?: number;

  @IsOptional()
  @IsString()
  testingRecommendation?: string;

  @IsOptional()
  @IsDateString()
  returnToWorkDate?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['very_low', 'low', 'medium', 'high', 'very_high'])
  riskLevel?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  urgency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

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

export class UpdateCovidDiagnosisDto {
  @IsOptional()
  @IsString()
  @IsEnum(['covid', 'flu', 'other'])
  diagnosisType?: string;

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
  @IsNumber()
  isolationDays?: number;

  @IsOptional()
  @IsString()
  testingRecommendation?: string;

  @IsOptional()
  @IsDateString()
  returnToWorkDate?: string;

  @IsOptional()
  @IsString()
  @IsEnum(['very_low', 'low', 'medium', 'high', 'very_high'])
  riskLevel?: string;

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
  @IsBoolean()
  requiresHospitalization?: boolean;

  @IsOptional()
  @IsString()
  medicationPrescription?: string;

  @IsOptional()
  @IsString()
  monitoringInstructions?: string;
} 