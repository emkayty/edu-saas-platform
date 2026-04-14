/**
 * Grading Configuration DTO
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsBoolean, IsArray, IsString, IsOptional, Min, Max } from 'class-validator';
import { GradingSystem, GradeDefinition, HonoursClassification } from '../types/grading-system';

export class ConfigureGradingDto {
  @ApiProperty({ description: 'Institution/Tenant ID' })
  @IsString()
  tenantId: string;

  @ApiProperty({ enum: GradingSystem, description: 'Grading system type' })
  @IsEnum(GradingSystem)
  system: GradingSystem;

  @ApiPropertyOptional({ description: 'Custom grade scale (optional)' })
  @IsArray()
  @IsOptional()
  gradingScale?: GradeDefinition[];

  @ApiPropertyOptional({ description: 'Minimum score to pass (default: 40 for Nigerian, 60 for American)' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  minimumPassScore?: number;

  @ApiPropertyOptional({ description: 'Allow carryover of failed courses' })
  @IsBoolean()
  @IsOptional()
  allowCarryOver?: boolean;

  @ApiPropertyOptional({ description: 'Maximum number of courses that can be carried over' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  maxCarryOverCourses?: number;

  @ApiPropertyOptional({ description: 'Number of decimal places for CGPA' })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(4)
  decimalPlaces?: number;

  @ApiPropertyOptional({ description: 'Round CGPA to decimal places' })
  @IsBoolean()
  @IsOptional()
  roundCGPA?: boolean;

  @ApiPropertyOptional({ description: 'Custom honours classifications' })
  @IsArray()
  @IsOptional()
  honoursClassification?: HonoursClassification[];
}

export class CalculateGradesDto {
  @ApiProperty({ description: 'Student ID' })
  @IsString()
  studentId: string;

  @ApiProperty({ description: 'Course results' })
  @IsArray()
  results: {
    courseId: string;
    courseCode: string;
    courseTitle: string;
    creditHours: number;
    score: number;
    semester: string;
  }[];

  @ApiProperty({ enum: GradingSystem, description: 'Grading system to use' })
  @IsEnum(GradingSystem)
  system: GradingSystem;
}

export class SemesterGpaDto {
  @ApiProperty({ description: 'Course results' })
  @IsArray()
  results: {
    creditHours: number;
    score: number;
  }[];

  @ApiProperty({ enum: GradingSystem })
  @IsEnum(GradingSystem)
  system: GradingSystem;
}

export class ClassificationDto {
  @ApiProperty({ description: 'Student CGPA', example: 3.75 })
  @IsNumber()
  cgpa: number;

  @ApiProperty({ enum: GradingSystem })
  @IsEnum(GradingSystem)
  system: GradingSystem;
}

export class ConvertGradeDto {
  @ApiProperty({ description: 'Grade letter to convert', example: 'A' })
  @IsString()
  grade: string;

  @ApiProperty({ enum: GradingSystem, description: 'Source system' })
  @IsEnum(GradingSystem)
  fromSystem: GradingSystem;

  @ApiProperty({ enum: GradingSystem, description: 'Target system' })
  @IsEnum(GradingSystem)
  toSystem: GradingSystem;
}

export class PreviewGradeDto {
  @ApiProperty({ description: 'Score to preview', example: 85 })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiProperty({ enum: GradingSystem })
  @IsEnum(GradingSystem)
  system: GradingSystem;
}

export class UpdateInstitutionConfigDto {
  @ApiProperty({ enum: GradingSystem })
  @IsEnum(GradingSystem)
  system: GradingSystem;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  minimumPassScore?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  allowCarryOver?: boolean;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxCarryOverCourses?: number;
}