import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() year?: number;
}

export class ReportQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() departmentId?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endDate?: string;
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsNumber() weeks?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() sessionId?: string;
}