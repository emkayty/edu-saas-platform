import { IsString, Min, Max, IsEmail, IsEnum, IsOptional, IsNumber, IsUUID, MinLength, MaxLength, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: 'First name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ enum: ['super_admin', 'admin', 'lecturer', 'student', 'parent', 'guest'] })
  @IsOptional()
  @IsEnum(['super_admin', 'admin', 'lecturer', 'student', 'parent', 'guest'])
  role?: string;

  @ApiPropertyOptional({ description: 'Tenant ID' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  // Student specific
  @ApiPropertyOptional({ description: 'Matriculation number (for students)' })
  @IsOptional()
  @IsString()
  matricNumber?: string;

  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Faculty' })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiPropertyOptional({ description: 'Level (100-500 for universities, 1-5 for polytechnics)' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(600)
  level?: number;

  // Lecturer specific
  @ApiPropertyOptional({ description: 'Staff number (for lecturers)' })
  @IsOptional()
  @IsString()
  staffNumber?: string;

  @ApiPropertyOptional({ description: 'Academic title (Prof, Dr, Mr, etc.)' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Specialization' })
  @IsOptional()
  @IsString()
  specialization?: string;

  // Common
  @ApiPropertyOptional({ description: 'Gender' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional({ description: 'Date of birth' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'suspended', 'pending'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended', 'pending'])
  status?: string;

  // Student specific
  @ApiPropertyOptional({ description: 'Department' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'Faculty' })
  @IsOptional()
  @IsString()
  faculty?: string;

  @ApiPropertyOptional({ description: 'Level' })
  @IsOptional()
  @IsNumber()
  level?: number;

  // Lecturer specific
  @ApiPropertyOptional({ description: 'Specialization' })
  @IsOptional()
  @IsString()
  specialization?: string;

  // Common
  @ApiPropertyOptional({ description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'Country' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Preferences' })
  @IsOptional()
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    language?: string;
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };

  @ApiPropertyOptional({ description: 'Custom fields' })
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UserQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by name, email, matric number, or staff number' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['super_admin', 'admin', 'lecturer', 'student', 'parent', 'guest'] })
  @IsOptional()
  @IsEnum(['super_admin', 'admin', 'lecturer', 'student', 'parent', 'guest'])
  role?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'suspended', 'pending'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended', 'pending'])
  status?: string;

  @ApiPropertyOptional({ description: 'Tenant ID for multi-tenant filtering' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;
}