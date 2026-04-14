import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsUUID, IsDecimal } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EmploymentType, StaffStatus, LeaveType } from '../entities/hr.entity';

export class CreateStaffProfileDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty() @IsString() staffNumber: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(EmploymentType) employmentType?: EmploymentType;
  @ApiPropertyOptional() @IsOptional() @IsDateString() appointmentDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() position?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() grade?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() step?: number;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() highestQualification?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() specialization?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() yearsOfExperience?: number;
  @ApiPropertyOptional() @IsOptional() @IsDecimal() basicSalary?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() bankName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccountNumber?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bankAccountName?: string;
}

export class UpdateStaffProfileDto extends PartialType(CreateStaffProfileDto) {}

export class CreateLeaveApplicationDto {
  @ApiProperty() @IsUUID() staffId: string;
  @ApiProperty({ enum: LeaveType }) @IsEnum(LeaveType) leaveType: LeaveType;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reason?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() substituteStaffId?: string;
}

export class ProcessPayrollDto {
  @ApiProperty() @IsNumber() month: number;
  @ApiProperty() @IsNumber() year: number;
}

export class HrQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() staffId?: string;
}