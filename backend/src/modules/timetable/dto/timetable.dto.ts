import { IsString, IsNumber, IsArray, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateTimetableDto {
  @ApiProperty() @IsString() sessionId: string;
  @ApiProperty() @IsNumber() semester: number;
}

export class CreateTimetableCourseDto {
  @ApiProperty() @IsString() courseId: string;
  @ApiProperty() @IsString() lecturerId: string;
  @ApiProperty() @IsString() departmentId: string;
  @ApiProperty() @IsNumber() level: number;
  @ApiProperty() @IsNumber() studentCount: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() requiredHours?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() preferredDays?: number[];
  @ApiPropertyOptional() @IsOptional() @IsArray() preferredSlots?: string[];
  @ApiPropertyOptional() @IsOptional() @IsBoolean() needsLab?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() needsProjector?: boolean;
}

export class CreateVenueDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() code: string;
  @ApiProperty() @IsNumber() capacity: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() facilities?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() building?: string;
}