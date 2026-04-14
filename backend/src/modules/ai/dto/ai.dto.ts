import { IsString, IsOptional, IsEnum, IsNumber, IsArray, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChatbotType } from '../entities/ai.entity';

// ============== CHATBOT DTOs ==============
export class StartConversationDto {
  @ApiProperty({ enum: ChatbotType }) @IsEnum(ChatbotType) chatbotType: ChatbotType;
  @ApiPropertyOptional() @IsOptional() @IsString() language?: string;
}

export class SendMessageDto {
  @ApiProperty() @IsString() message: string;
}

export class ChatFeedbackDto {
  @ApiProperty() @IsNumber() rating: number;
  @ApiPropertyOptional() @IsOptional() @IsString() feedback?: string;
}

// ============== RAG DTOs ==============
export class CreateRagDocumentDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() content: string;
  @ApiProperty() @IsString() source: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() metadata?: Record<string, any>;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
}

// ============== INSIGHTS DTOs ==============
export class GetInsightsDto {
  @ApiPropertyOptional() @IsOptional() @IsString() type?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() studentId?: string;
}

export class ResolveInsightDto {
  @ApiProperty() @IsString() interventionStatus: string;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

// ============== PREDICTIONS DTOs ==============
export class PredictDropoutDto {
  @ApiProperty() @IsUUID() studentId: string;
}

export class PredictGradeDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsString() courseId: string;
}

// ============== LEARNING PATH DTOs ==============
export class CreateLearningPathDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsString() courseId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
}

export class GetRecommendationsDto {
  @ApiProperty() @IsUUID() studentId: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() careerGoals?: string[];
}

// ============== ASSESSMENT DTOs ==============
export class GradeAssignmentDto {
  @ApiProperty() @IsString() assignmentId: string;
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsString() content: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() criteria?: { name: string; maxScore: number }[];
}

export class CheckPlagiarismDto {
  @ApiProperty() @IsString() submissionId: string;
  @ApiProperty() @IsUUID() studentId: string;
  @ApiProperty() @IsString() content: string;
}

// ============== SEMANTIC SEARCH DTOs ==============
export class SemanticSearchDto {
  @ApiProperty() @IsString() query: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() entityTypes?: string[];
  @ApiPropertyOptional() @IsOptional() @IsNumber() limit?: number;
}

export class IndexContentDto {
  @ApiProperty() @IsString() entityType: string;
  @ApiProperty() @IsString() entityId: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() content: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() metadata?: Record<string, any>;
}

// ============== ADMIN AUTOMATION DTOs ==============
export class ForecastEnrollmentDto {
  @ApiProperty() @IsString() sessionId: string;
  @ApiProperty() @IsNumber() semester: number;
}

export class DetectAnomalyDto {
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsString() entityId: string;
  @ApiProperty() @IsString() entityType: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() data?: Record<string, any>;
}

export class AnalyzeSentimentDto {
  @ApiProperty() @IsString() feedbackText: string;
  @ApiProperty() @IsString() entityType: string;
  @ApiProperty() @IsString() entityId: string;
}

// ============== QUESTION BANK DTOs ==============
export class AnalyzeQuestionBankDto {
  @ApiProperty() @IsString() courseId: string;
}

export class AddQuestionDto {
  @ApiProperty() @IsString() question: string;
  @ApiProperty() @IsString() answer: string;
  @ApiProperty() @IsString() courseId: string;
  @ApiProperty() @IsString() type: string;
  @ApiProperty() @IsString() difficulty: string;
  @ApiPropertyOptional() @IsOptional() @IsArray() tags?: string[];
}