import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum, IsArray, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { MaterialType, BookStatus } from '../entities/library.entity';

// ============== BOOK DTOs ==============

export class CreateBookDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subtitle?: string;
  @ApiProperty() @IsString() isbn: string;
  @ApiPropertyOptional() @IsOptional() @IsString() issn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() author?: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() authors?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() publisher?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() publishYear?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() edition?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(MaterialType) materialType?: MaterialType;
  @ApiPropertyOptional() @IsOptional() @IsString() deweyDecimal?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() libraryOfCongress?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subject?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() pages?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() binding?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() price?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() currency?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() totalCopies?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() shelfLocation?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() section?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() eResourceUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isEResource?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() coverImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isTechnical?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsArray() keywords?: string[];
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

export class SearchBookQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(MaterialType) materialType?: MaterialType;
  @ApiPropertyOptional() @IsOptional() @IsString() subject?: string;
  @ApiPropertyOptional() @IsOptional() @IsEnum(BookStatus) status?: BookStatus;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) page?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(1) @Max(100) limit?: number;
}

// ============== BORROWING DTOs ==============

export class CreateBorrowingDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty() @IsUUID() bookId: string;
}

export class BorrowingQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() userId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?: string;
}

// ============== RESERVATION DTOs ==============

export class CreateReservationDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty() @IsUUID() bookId: string;
}

// ============== BOOK REQUEST DTOs ==============

export class CreateBookRequestDto {
  @ApiProperty() @IsUUID() userId: string;
  @ApiProperty() @IsString() bookTitle: string;
  @ApiPropertyOptional() @IsOptional() @IsString() author?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() isbn?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() purpose?: string;
}

// ============== LIBRARY HOURS DTOs ==============

export class UpdateHoursDto {
  @ApiProperty() @IsNumber() @Min(0) @Max(6) dayOfWeek: number;
  @ApiProperty() @IsString() openingTime: string;
  @ApiProperty() @IsString() closingTime: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isOpen?: boolean;
}