import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimetableController } from './controllers/timetable.controller';
import { TimetableService } from './services/timetable.service';
import { TimetableSession, TimetableCourse, TimetableSlot, TimetableVenue, TimetableConflict } from './entities/timetable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TimetableSession, TimetableCourse, TimetableSlot, TimetableVenue, TimetableConflict])],
  controllers: [TimetableController],
  providers: [TimetableService],
  exports: [TimetableService],
})
export class TimetableModule {}