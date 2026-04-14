import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicsController } from './academics.controller';
import { AcademicsService } from './services/academics.service';
import { Department, Faculty, Program } from './entities/department.entity';
import { Course, AcademicSession, CourseAllocation, StudentCourse } from './entities/course.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department, Faculty, Program, 
      Course, AcademicSession, CourseAllocation, StudentCourse
    ])
  ],
  controllers: [AcademicsController],
  providers: [AcademicsService],
  exports: [AcademicsService],
})
export class AcademicsModule {}