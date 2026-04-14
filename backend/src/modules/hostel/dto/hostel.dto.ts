import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

// ============== HOSTEL DTOs ==============

export class CreateHostelDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiProperty() @IsString() gender: string;
  @ApiPropertyOptional() @IsOptional() @IsString() wardenName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() wardenPhone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() wardenEmail?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() facilities?: string[];
}

export class UpdateHostelDto extends PartialType(CreateHostelDto) {}

// ============== ROOM DTOs ==============

export class CreateRoomDto {
  @ApiProperty() @IsUUID() hostelId: string;
  @ApiProperty() @IsString() roomNumber: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() floor?: number;
  @ApiProperty() @IsNumber() capacity: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() facilities?: string[];
  @ApiProperty() @IsNumber() pricePerBed: number;
  @ApiPropertyOptional() @IsOptional() @IsString() roomType?: string;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}

// ============== ALLOCATION DTOs ==============

export class AllocateStudentDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsUUID() hostelId: string;
  @ApiProperty() @IsUUID() roomId: string;
  @ApiProperty() @IsUUID() sessionId: string;
}

// ============== MAINTENANCE DTOs ==============

export class CreateMaintenanceDto {
  @ApiProperty() @IsUUID() roomId: string;
  @ApiProperty() @IsString() reportedBy: string;
  @ApiProperty() @IsString() category: string;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['low', 'medium', 'high', 'urgent']) priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class UpdateMaintenanceDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  @ApiPropertyOptional() @IsOptional() @IsString() assignedTo?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() cost?: number;
}

// ============== COMPLAINT DTOs ==============

export class CreateComplaintDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsUUID() hostelId: string;
  @ApiProperty() @IsString() description: string;
}

// ============== QUERY DTOs ==============

export class HostelQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() hostelId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() roomId?: string;
}