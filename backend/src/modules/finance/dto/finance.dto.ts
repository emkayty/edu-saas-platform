import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsUUID, IsDateString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { FeeCategory } from '../entities/finance.entity';

// ============== FEE STRUCTURE DTOs ==============

export class InstallmentPlanDto {
  @ApiProperty() @IsNumber() percentage: number;
  @ApiProperty() @IsDateString() deadline: Date;
}

export class CreateFeeStructureDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsUUID() sessionId: string;
  @ApiProperty() @IsNumber() amount: number;
  @ApiProperty({ enum: FeeCategory }) @IsEnum(FeeCategory) category: FeeCategory;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isCompulsory?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() paymentDeadline?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() hasLatePenalty?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsNumber() latePenaltyPercentage?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() allowsInstallment?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsValidateNested() @Type(() => InstallmentPlanDto) installmentPlan?: any;
  @ApiPropertyOptional() @IsOptional() @IsUUID() departmentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() programId?: string;
}

export class UpdateFeeStructureDto extends PartialType(CreateFeeStructureDto) {}

// ============== PAYMENT DTOs ==============

export class CreatePaymentDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() studentFeeId?: string;
  @ApiProperty() @IsNumber() amount: string;
  @ApiProperty() @IsString() paymentMethod: string;
  @ApiPropertyOptional() @IsOptional() @IsString() reference?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() channel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}

export class PaymentQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() studentId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() sessionId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

// ============== SCHOLARSHIP DTOs ==============

export class CreateScholarshipDto {
  @ApiProperty() @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() amount: number;
  @ApiPropertyOptional() @IsOptional() @IsEnum(['percentage', 'fixed']) type?: 'percentage' | 'fixed';
  @ApiPropertyOptional() @IsOptional() @IsNumber() percentage?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() criteria?: string;
}

export class UpdateScholarshipDto extends PartialType(CreateScholarshipDto) {}

export class ApplyScholarshipDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsUUID() scholarshipId: string;
  @ApiProperty() @IsNumber() amount: number;
}

// ============== INVOICE DTOs ==============

export class GenerateInvoiceDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsUUID() sessionId: string;
}