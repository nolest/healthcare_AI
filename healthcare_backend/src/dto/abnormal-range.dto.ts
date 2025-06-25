import { IsString, IsObject, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class RangeValue {
  min: number;
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

export class CreateAbnormalRangeDto {
  @IsString()
  measurementType: string;

  @IsString()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => NormalRangeDto)
  normalRange: NormalRangeDto;

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
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 