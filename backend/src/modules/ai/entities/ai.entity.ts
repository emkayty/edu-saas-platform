import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

// ============== CHATBOT ENUMS ==============
export enum ChatbotType { 
  STUDENT_SUPPORT = 'student_support', 
  ADMISSION = 'admission', 
  ACADEMIC = 'academic', 
  ADMIN = 'admin',
  FINANCIAL = 'financial',
  ADVISOR = 'advisor' 
}
export enum ChatStatus { ACTIVE = 'active', COMPLETED = 'completed', ESCALATED = 'escalated' }

// ============== CHATBOT ENTITIES ==============
@Entity('chatbot_conversations')
export class ChatConversation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() userId: string;
  @Column({ type: 'enum', enum: ChatbotType }) chatbotType: ChatbotType;
  @Column({ type: 'enum', enum: ChatStatus, default: ChatStatus.ACTIVE }) status: ChatStatus;
  @Column({ type: 'jsonb', default: [] }) messages: { role: 'user' | 'assistant'; content: string; timestamp: Date; language?: string }[];
  @Column({ default: false }) isEscalated: boolean;
  @Column({ nullable: true }) escalatedTo: string;
  @Column({ nullable: true }) rating: number;
  @Column({ nullable: true }) feedback: string;
  @Column({ default: 'en' }) language: string;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('chatbot_intents')
export class ChatbotIntent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() description: string;
  @Column({ type: 'jsonb', default: [] }) patterns: string[];
  @Column({ type: 'jsonb', default: [] }) responses: string[];
  @Column({ type: 'jsonb', default: [] }) responsesHa: string[];
  @Column({ type: 'jsonb', default: [] }) responsesIg: string[];
  @Column({ type: 'jsonb', default: [] }) responsesYo: string[];
  @Column({ nullable: true }) action: string;
  @Column({ type: 'jsonb', default: {} }) parameters: Record<string, any>;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) confidence: number;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

// ============== RAG & KNOWLEDGE BASE ==============
@Entity('rag_documents')
export class RagDocument {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ type: 'text' }) content: string;
  @Column() source: string;
  @Column({ type: 'jsonb', default: [] }) metadata: Record<string, any>;
  @Column({ type: 'text', nullable: true }) embedding: string;
  @Column({ default: 'pending' }) status: 'pending' | 'indexed' | 'failed';
  @Column({ type: 'jsonb', default: [] }) tags: string[];
  @Column({ nullable: true }) category: string;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

// ============== STUDENT SUCCESS & PREDICTIONS ==============
@Entity('ai_insights')
export class AiInsight {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() type: string;
  @Column() entityId: string;
  @Column() entityType: string;
  @Column() confidence: number;
  @Column({ type: 'jsonb' }) data: Record<string, any>;
  @Column({ default: false }) isRead: boolean;
  @Column({ default: false }) isResolved: boolean;
  @Column({ nullable: true }) recommendation: string;
  @Column({ nullable: true }) interventionStatus: string;
  @Column({ nullable: true }) interventionDate: Date;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('student_predictions')
export class StudentPrediction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() studentId: string;
  @Column() predictionType: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) probability: number;
  @Column({ type: 'jsonb', default: {} }) factors: Record<string, any>;
  @Column({ nullable: true }) predictedValue: string;
  @Column({ default: 'active' }) status: string;
  @Column({ nullable: true }) actualOutcome: string;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

// ============== PERSONALIZED LEARNING ==============
@Entity('learning_paths')
export class LearningPath {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() studentId: string;
  @Column() courseId: string;
  @Column() title: string;
  @Column({ type: 'jsonb', default: [] }) recommendations: { resourceId: string; type: string; reason: string; priority: number }[];
  @Column({ type: 'jsonb', default: [] }) studyPlan: { week: number; topics: string[]; activities: string[] }[];
  @Column({ default: 'active' }) status: string;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('course_recommendations')
export class CourseRecommendation {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() studentId: string;
  @Column() courseId: string;
  @Column() reason: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) score: number;
  @Column({ default: false }) accepted: boolean;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

// ============== INTELLIGENT ASSESSMENT ==============
@Entity('ai_graded_assignments')
export class AiGradedAssignment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() assignmentId: string;
  @Column() studentId: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) aiScore: number;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) finalScore: number;
  @Column({ type: 'jsonb', default: {} }) feedback: Record<string, any>;
  @Column({ type: 'jsonb', default: [] }) criteriaScores: { criterion: string; score: number; comments: string }[];
  @Column({ default: 'pending' }) status: string;
  @Column({ nullable: true }) reviewedBy: string;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('plagiarism_reports')
export class PlagiarismReport {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() submissionId: string;
  @Column() studentId: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) similarityScore: number;
  @Column({ type: 'jsonb', default: [] }) sources: { url: string; matchedText: string; percentage: number }[];
  @Column({ default: 'clean' }) status: string;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('question_bank_items')
export class QuestionBankItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() question: string;
  @Column({ type: 'text' }) answer: string;
  @Column() courseId: string;
  @Column() type: string;
  @Column() difficulty: string;
  @Column({ type: 'jsonb', default: [] }) tags: string[];
  @Column({ type: 'jsonb', default: {} }) metadata: Record<string, any>;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

// ============== SEMANTIC SEARCH ==============
@Entity('semantic_search_index')
export class SemanticSearchIndex {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() entityType: string;
  @Column() entityId: string;
  @Column() title: string;
  @Column({ type: 'text' }) content: string;
  @Column({ type: 'text', nullable: true }) embedding: string;
  @Column({ type: 'jsonb', default: {} }) metadata: Record<string, any>;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

// ============== ADMINISTRATIVE AUTOMATION ==============
@Entity('enrollment_forecasts')
export class EnrollmentForecast {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() sessionId: string;
  @Column() semester: number;
  @Column() predicted: number;
  @Column() confidence: number;
  @Column({ type: 'jsonb', default: {} }) factors: Record<string, any>;
  @Column({ nullable: true }) actual: number;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('anomaly_alerts')
export class AnomalyAlert {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() type: string;
  @Column() entityId: string;
  @Column() entityType: string;
  @Column() description: string;
  @Column() severity: string;
  @Column({ type: 'jsonb', default: {} }) details: Record<string, any>;
  @Column({ default: 'active' }) status: string;
  @Column({ nullable: true }) resolvedAt: Date;
  @Column({ nullable: true }) resolution: string;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('sentiment_analyses')
export class SentimentAnalysis {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() entityType: string;
  @Column() entityId: string;
  @Column() sentiment: string;
  @Column({ type: 'decimal', precision: 5, scale: 2 }) score: number;
  @Column({ type: 'jsonb', default: [] }) keyPhrases: string[];
  @Column({ type: 'jsonb', default: {} }) summary: Record<string, any>;
  @Column({ nullable: true }) tenantId: string;
  @CreateDateColumn() createdAt: Date;
}