import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: '用户名' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '全名' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ description: '邮箱' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: '角色', enum: ['patient', 'medical_staff'] })
  @IsEnum(['patient', 'medical_staff'])
  role: string;

  @ApiProperty({ description: '电话', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '出生日期', required: false })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({ description: '性别', enum: ['male', 'female', 'other'], required: false })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'])
  gender?: string;

  @ApiProperty({ description: '科室（医护人员）', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: '执照号（医护人员）', required: false })
  @IsOptional()
  @IsString()
  license_number?: string;
} 