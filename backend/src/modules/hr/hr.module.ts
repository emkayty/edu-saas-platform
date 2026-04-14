import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HrController } from './controllers/hr.controller';
import { HrService } from './services/hr.service';
import { StaffProfile, LeaveApplication, PayrollRecord, StaffAttendance } from './entities/hr.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StaffProfile, LeaveApplication, PayrollRecord, StaffAttendance])],
  controllers: [HrController],
  providers: [HrService],
  exports: [HrService],
})
export class HrModule {}