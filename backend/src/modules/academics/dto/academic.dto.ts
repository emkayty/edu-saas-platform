import { IsString, IsOptional, IsNumber, IsBoolean, IsArray, IsEnum, IsDateString, ValidateNested, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ============== FACULTY DTOs ==============

export class CreateFacultyDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deanName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deanEmail?: string;
}

export class UpdateFacultyDto extends PartialType(CreateFacultyDto) {}

// ============== DEPARTMENT DTOs ==============

export class CreateDepartmentDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() faculty?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() maxLevels?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() programTypes?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasIndustrialTraining?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() hodName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hodEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() office?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() facultyId?: string;
}

export class UpdateDepartmentDto extends PartialType(CreateDepartmentDto) {}

// ============== PROGRAM DTOs ==============

export class CreateProgramDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsString() type: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() duration?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() creditLoad?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() facultyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() accreditationStatus?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() accreditationExpiry?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasIndustrialTraining?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() industrialTrainingDuration?: number;
}

export class UpdateProgramDto extends PartialType(CreateProgramDto) {}

// ============== COURSE DTOs ==============

export class CreateCourseDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() code: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() creditHours: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() courseOutline?: string[];
  @ApiPropertyOptional() @IsOptional() @IsArray() prerequisites?: string[];
  @ApiProperty() @IsNumber() level: number;
  @ApiProperty() @IsNumber() semester: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() programs?: string[];
  @ApiPropertyOptional() @IsOptional() @IsValidateNested() @Type(() => AssessmentWeightsDto) assessmentWeights?: AssessmentWeightsDto;
  @ApiPropertyOptional() @IsOptional() @IsNumber() passMark?: number;
}

export class UpdateCourseDto extends PartialType(CreateCourseDto) {}

export class AssessmentWeightsDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() ca?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() exam?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() practical?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() project?: number;
}

// ============== ACADEMIC SESSION DTOs ==============

export class CreateAcademicSessionDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() sessionCode: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() numberOfSemesters?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() courseRegistrationStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() courseRegistrationEnd?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() examStartDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() examEndDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() industrialTrainingStart?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() industrialTrainingEnd?: string;
}

export class UpdateAcademicSessionDto extends PartialType(CreateAcademicSessionDto) {}

// ============== COURSE ALLOCATION DTOs ==============

export class CourseAllocationDto {
  @ApiProperty() @IsUUID() courseId: string;
  @ApiProperty() @IsUUID() lecturerId: string;
  @ApiProperty() @IsUUID() sessionId: string;
  @ApiProperty() @IsNumber() semester: number;
}

// ============== STUDENT COURSE REGISTRATION DTOs ==============

export class StudentCourseRegistrationDto {
  @ApiProperty() @IsUUID() sessionId: string;
  @ApiProperty() @IsNumber() semester: number;
  @ApiProperty() @IsArray() @IsUUID({}, { each: true }) courseIds: string[];
}

// ============== GRADE ENTRY DTOs ==============

export class GradeEntryDto {
  @ApiProperty() @IsUUID() studentCourseId: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() caScore?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() examScore?: number;
}

export class BulkGradeEntryDto {
  @ApiProperty() @IsArray() @ValidateNested({ each: true }) @Type(() => GradeEntryDto) grades: GradeEntryDto[];
}

// ============== QUERY DTOs ==============

export class AcademicQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() facultyId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() level?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() semester?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sessionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() studentId?: string;
}