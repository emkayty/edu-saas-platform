import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LmsService } from './services/lms.service';
import { LmsController } from './controllers/lms.controller';
import { LmsCourse, LmsEnrollment, LmsQuiz, LmsQuizAttempt, LmsAssignment, LmsSubmission, LmsDiscussion } from './entities/lms.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LmsCourse, LmsEnrollment, LmsQuiz, LmsQuizAttempt, LmsAssignment, LmsSubmission, LmsDiscussion
    ])
  ],
  controllers: [LmsController],
  providers: [LmsService],
  exports: [LmsService],
})
export class LmsModule {}