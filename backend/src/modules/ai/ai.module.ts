import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiController } from './controllers/ai.controller';
import { AiService } from './services/ai.service';
import { 
  ChatConversation, ChatbotIntent, RagDocument, AiInsight, 
  StudentPrediction, LearningPath, CourseRecommendation,
  AiGradedAssignment, PlagiarismReport, QuestionBankItem,
  SemanticSearchIndex, EnrollmentForecast, AnomalyAlert, SentimentAnalysis
} from './entities/ai.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    ChatConversation, ChatbotIntent, RagDocument, AiInsight,
    StudentPrediction, LearningPath, CourseRecommendation,
    AiGradedAssignment, PlagiarismReport, QuestionBankItem,
    SemanticSearchIndex, EnrollmentForecast, AnomalyAlert, SentimentAnalysis
  ])],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}