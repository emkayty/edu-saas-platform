import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExaminationService } from './services/examination.service';
import { GradingService } from './services/grading.service';
import { ExaminationController } from './controllers/examination.controller';
import { GradingController } from './controllers/grading.controller';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [ExaminationController, GradingController],
  providers: [ExaminationService, GradingService],
  exports: [ExaminationService, GradingService],
})
export class ExaminationModule {}