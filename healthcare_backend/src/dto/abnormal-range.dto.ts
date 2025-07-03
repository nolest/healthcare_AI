import { IsString, IsObject, IsOptional, IsBoolean, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class RangeValue {
  @IsNumber()
  min: number;

  @IsNumber()
  max: number;
}

class NormalRangeDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  systolic?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  diastolic?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  heartRate?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  temperature?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  oxygenSaturation?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  bloodGlucose?: RangeValue;
}

class AbnormalLevelsDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  critical?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  severeHigh?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  high?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  low?: RangeValue;

  @IsOptional()
  @ValidateNested()
  @Type(() => RangeValue)
  severeLow?: RangeValue;
}

class AbnormalRangesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => AbnormalLevelsDto)
  systolic?: AbnormalLevelsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AbnormalLevelsDto)
  diastolic?: AbnormalLevelsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AbnormalLevelsDto)
  heartRate?: AbnormalLevelsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AbnormalLevelsDto)
  temperature?: AbnormalLevelsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AbnormalLevelsDto)
  oxygenSaturation?: AbnormalLevelsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AbnormalLevelsDto)
  bloodGlucose?: AbnormalLevelsDto;
}

export class CreateAbnormalRangeDto {
  @IsString()
  measurementType: string;

  @IsString()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => NormalRangeDto)
  normalRange: NormalRangeDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AbnormalRangesDto)
  abnormalRanges?: AbnormalRangesDto;

  @IsString()
  unit: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAbnormalRangeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NormalRangeDto)
  normalRange?: NormalRangeDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => AbnormalRangesDto)
  abnormalRanges?: AbnormalRangesDto;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 