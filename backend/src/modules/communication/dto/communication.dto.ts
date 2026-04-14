import { IsString, IsBoolean, IsDateString, IsOptional, IsEnum, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from '../entities/communication.entity';

export class SendNotificationDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty({ enum: NotificationType }) @IsEnum(NotificationType) type: NotificationType;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() message: string;
  @ApiPropertyOptional() @IsOptional() @IsString() channel?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() recipient?: string;
}

export class CreateEmailTemplateDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() subject: string;
  @ApiProperty() @IsString() body: string;
}

export class CreateSmsTemplateDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() message: string;
}

export class CreateAnnouncementDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() content: string;
  @ApiPropertyOptional() @IsOptional() @IsString() targetRoles?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() targetDepartment?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPinned?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsDateString() expiryDate?: string;
}